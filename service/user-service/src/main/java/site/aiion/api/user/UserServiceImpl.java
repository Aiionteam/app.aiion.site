package site.aiion.api.user;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
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
                .password(entity.getPassword())
                .build();
    }

    private User modelToEntity(UserModel model) {
        return User.builder()
                .id(model.getId())
                .name(model.getName())
                .email(model.getEmail())
                .password(model.getPassword())
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
    @Transactional
    public Messenger save(UserModel userModel) {
        User entity = modelToEntity(userModel);
        User saved = userRepository.save(entity);
        UserModel model = entityToModel(saved);
        return Messenger.builder()
                .Code(200)
                .message("저장 성공: " + saved.getId())
                .data(model)
                .build();
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
                    .password(userModel.getPassword() != null ? userModel.getPassword() : existing.getPassword())
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
