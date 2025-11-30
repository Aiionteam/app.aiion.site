package site.aiion.api.user;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import site.aiion.api.user.common.domain.Messenger;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    private UserModel entityToModel(User entity) {
        return UserModel.builder()
                .id(entity.getId())
                .name(entity.getName())
                .email(entity.getEmail())
                .nickname(entity.getNickname())
                .provider(entity.getProvider())
                .providerId(entity.getProviderId())
                .build();
    }

    private User modelToEntity(UserModel model) {
        // nickname이 없으면 name과 동일하게 설정
        String nickname = model.getNickname();
        if (nickname == null || nickname.trim().isEmpty()) {
            nickname = model.getName();
        }
        
        return User.builder()
                .id(model.getId())
                .name(model.getName())
                .email(model.getEmail())
                .nickname(nickname)
                .provider(model.getProvider())
                .providerId(model.getProviderId())
                .build();
    }

    @Override
    public Messenger findById(UserModel userModel) {
        if (userModel.getId() == null) {
            return Messenger.builder()
                    .Code(400)
                    .message("ID가 필요합니다.")
                    .build();
        }
        Optional<User> entity = userRepository.findById(userModel.getId());
        if (entity.isPresent()) {
            UserModel model = entityToModel(entity.get());
            return Messenger.builder()
                    .Code(200)
                    .message("조회 성공")
                    .data(model)
                    .build();
        } else {
            return Messenger.builder()
                    .Code(404)
                    .message("사용자를 찾을 수 없습니다.")
                    .build();
        }
    }

    @Override
    public Messenger findByEmailAndProvider(String email, String provider) {
        if (email == null || email.trim().isEmpty()) {
            return Messenger.builder()
                    .Code(400)
                    .message("이메일이 필요합니다.")
                    .build();
        }
        if (provider == null || provider.trim().isEmpty()) {
            return Messenger.builder()
                    .Code(400)
                    .message("제공자 정보가 필요합니다.")
                    .build();
        }
        
        Optional<User> entity = userRepository.findByEmailAndProvider(email, provider);
        if (entity.isPresent()) {
            UserModel model = entityToModel(entity.get());
            return Messenger.builder()
                    .Code(200)
                    .message("조회 성공")
                    .data(model)
                    .build();
        } else {
            return Messenger.builder()
                    .Code(404)
                    .message("사용자를 찾을 수 없습니다.")
                    .build();
        }
    }

    @Override
    public Messenger findAll() {
        List<User> entities = userRepository.findAll();
        List<UserModel> modelList = entities.stream()
                .map(this::entityToModel)
                .collect(Collectors.toList());
        return Messenger.builder()
                .Code(200)
                .message("전체 조회 성공: " + modelList.size() + "개")
                .data(modelList)
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Messenger save(UserModel userModel) {
        try {
            User entity = modelToEntity(userModel);
            User saved = userRepository.save(entity);
            UserModel model = entityToModel(saved);
            return Messenger.builder()
                    .Code(200)
                    .message("저장 성공: " + saved.getId())
                    .data(model)
                    .build();
        } catch (DataIntegrityViolationException e) {
            // 중복 키 에러 (이미 존재하는 사용자)
            // 트랜잭션을 롤백하고 새로운 트랜잭션에서 기존 사용자를 조회하여 반환
            if (userModel.getEmail() != null && userModel.getProvider() != null) {
                // 현재 트랜잭션을 명시적으로 롤백 표시 (실제 롤백은 메서드 종료 시)
                org.springframework.transaction.interceptor.TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                return findExistingUserInNewTransaction(userModel.getEmail(), userModel.getProvider());
            }
            // 조회 실패 시 에러 반환
            return Messenger.builder()
                    .Code(409)
                    .message("이미 존재하는 사용자입니다. 이메일: " + userModel.getEmail())
                    .build();
        }
    }
    
    /**
     * 새로운 트랜잭션에서 기존 사용자 조회
     * 중복 키 에러 발생 후 세션이 예외 상태이므로 별도 트랜잭션 필요
     * noRollbackFor를 사용하여 이 트랜잭션은 롤백되지 않도록 함
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, noRollbackFor = {RuntimeException.class})
    private Messenger findExistingUserInNewTransaction(String email, String provider) {
        try {
            Optional<User> existingUser = userRepository.findByEmailAndProvider(email, provider);
            if (existingUser.isPresent()) {
                UserModel model = entityToModel(existingUser.get());
                return Messenger.builder()
                        .Code(200)
                        .message("이미 존재하는 사용자: " + existingUser.get().getId())
                        .data(model)
                        .build();
            }
            return Messenger.builder()
                    .Code(409)
                    .message("이미 존재하는 사용자입니다. 이메일: " + email)
                    .build();
        } catch (Exception e) {
            // 에러 발생 시에도 409 반환
            System.err.println("[UserServiceImpl] findExistingUserInNewTransaction 에러: " + e.getMessage());
            e.printStackTrace();
            return Messenger.builder()
                    .Code(409)
                    .message("이미 존재하는 사용자입니다. 이메일: " + email)
                    .build();
        }
    }

    @Override
    @Transactional
    public Messenger saveAll(List<UserModel> userModelList) {
        List<User> entities = userModelList.stream()
                .map(this::modelToEntity)
                .collect(Collectors.toList());
        
        List<User> saved = userRepository.saveAll(entities);
        return Messenger.builder()
                .Code(200)
                .message("일괄 저장 성공: " + saved.size() + "개")
                .build();
    }

    @Override
    @Transactional
    public Messenger update(UserModel userModel) {
        if (userModel.getId() == null) {
            return Messenger.builder()
                    .Code(400)
                    .message("ID가 필요합니다.")
                    .build();
        }
        Optional<User> optionalEntity = userRepository.findById(userModel.getId());
        if (optionalEntity.isPresent()) {
            User existing = optionalEntity.get();
            
            User updated = User.builder()
                    .id(existing.getId())
                    .name(userModel.getName() != null ? userModel.getName() : existing.getName())
                    .email(userModel.getEmail() != null ? userModel.getEmail() : existing.getEmail())
                    .nickname(userModel.getNickname() != null ? userModel.getNickname() : existing.getNickname())
                    .provider(userModel.getProvider() != null ? userModel.getProvider() : existing.getProvider())
                    .providerId(userModel.getProviderId() != null ? userModel.getProviderId() : existing.getProviderId())
                    .build();
            
            User saved = userRepository.save(updated);
            UserModel model = entityToModel(saved);
            return Messenger.builder()
                    .Code(200)
                    .message("수정 성공: " + userModel.getId())
                    .data(model)
                    .build();
        } else {
            return Messenger.builder()
                    .Code(404)
                    .message("수정할 사용자를 찾을 수 없습니다.")
                    .build();
        }
    }

    @Override
    @Transactional
    public Messenger delete(UserModel userModel) {
        if (userModel.getId() == null) {
            return Messenger.builder()
                    .Code(400)
                    .message("ID가 필요합니다.")
                    .build();
        }
        Optional<User> optionalEntity = userRepository.findById(userModel.getId());
        if (optionalEntity.isPresent()) {
            userRepository.deleteById(userModel.getId());
            return Messenger.builder()
                    .Code(200)
                    .message("삭제 성공: " + userModel.getId())
                    .build();
        } else {
            return Messenger.builder()
                    .Code(404)
                    .message("삭제할 사용자를 찾을 수 없습니다.")
                    .build();
        }
    }

}
