package site.aiion.api.diary;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import site.aiion.api.diary.common.domain.Messenger;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class DiaryServiceImpl implements DiaryService {

    private final DiaryRepository diaryRepository;

    private DiaryModel entityToModel(Diary entity) {
        return DiaryModel.builder()
                .id(entity.getId())
                .diaryDate(entity.getDiaryDate())
                .title(entity.getTitle())
                .content(entity.getContent())
                .userId(entity.getUserId())
                .build();
    }

    private Diary modelToEntity(DiaryModel model) {
        return Diary.builder()
                .id(model.getId())
                .diaryDate(model.getDiaryDate())
                .title(model.getTitle())
                .content(model.getContent())
                .userId(model.getUserId())
                .build();
    }

    @Override
    public Messenger findById(DiaryModel diaryModel) {
        if (diaryModel.getId() == null) {
            return Messenger.builder()
                    .Code(400)
                    .message("ID가 필요합니다.")
                    .build();
        }
        Optional<Diary> entity = diaryRepository.findById(diaryModel.getId());
        if (entity.isPresent()) {
            DiaryModel model = entityToModel(entity.get());
            return Messenger.builder()
                    .Code(200)
                    .message("조회 성공")
                    .data(model)
                    .build();
        } else {
            return Messenger.builder()
                    .Code(404)
                    .message("일기를 찾을 수 없습니다.")
                    .build();
        }
    }

    @Override
    public Messenger findAll() {
        List<Diary> entities = diaryRepository.findAll();
        List<DiaryModel> modelList = entities.stream()
                .map(this::entityToModel)
                .collect(Collectors.toList());
        return Messenger.builder()
                .Code(200)
                .message("전체 조회 성공: " + modelList.size() + "개")
                .data(modelList)
                .build();
    }

    @Override
    public Messenger findByUserId(Long userId) {
        if (userId == null) {
            return Messenger.builder()
                    .Code(400)
                    .message("사용자 ID가 필요합니다.")
                    .build();
        }
        List<Diary> entities = diaryRepository.findByUserId(userId);
        List<DiaryModel> modelList = entities.stream()
                .map(this::entityToModel)
                .collect(Collectors.toList());
        return Messenger.builder()
                .Code(200)
                .message("사용자별 조회 성공: " + modelList.size() + "개")
                .data(modelList)
                .build();
    }

    @Override
    @Transactional
    public Messenger save(DiaryModel diaryModel) {
        if (diaryModel.getDiaryDate() == null) {
            return Messenger.builder()
                    .Code(400)
                    .message("일자 정보는 필수 값입니다.")
                    .build();
        }
        
        // userId가 필수값
        if (diaryModel.getUserId() == null) {
            return Messenger.builder()
                    .Code(400)
                    .message("사용자 ID는 필수 값입니다.")
                    .build();
        }
        
        Diary entity = modelToEntity(diaryModel);
        Diary saved = diaryRepository.save(entity);
        DiaryModel model = entityToModel(saved);
        return Messenger.builder()
                .Code(200)
                .message("저장 성공: " + saved.getId())
                .data(model)
                .build();
    }

    @Override
    @Transactional
    public Messenger saveAll(List<DiaryModel> diaryModelList) {
        // userId가 없는 항목이 있는지 확인
        boolean hasNullUserId = diaryModelList.stream()
                .anyMatch(model -> model.getUserId() == null);
        
        if (hasNullUserId) {
            return Messenger.builder()
                    .Code(400)
                    .message("사용자 ID는 필수 값입니다. 모든 일기에 사용자 ID를 설정해주세요.")
                    .build();
        }
        
        List<Diary> entities = diaryModelList.stream()
                .map(this::modelToEntity)
                .collect(Collectors.toList());
        
        List<Diary> saved = diaryRepository.saveAll(entities);
        return Messenger.builder()
                .Code(200)
                .message("일괄 저장 성공: " + saved.size() + "개")
                .build();
    }

    @Override
    @Transactional
    public Messenger update(DiaryModel diaryModel) {
        if (diaryModel.getId() == null) {
            return Messenger.builder()
                    .Code(400)
                    .message("ID가 필요합니다.")
                    .build();
        }
        Optional<Diary> optionalEntity = diaryRepository.findById(diaryModel.getId());
        if (optionalEntity.isPresent()) {
            Diary existing = optionalEntity.get();
            
            Diary updated = Diary.builder()
                    .id(existing.getId())
                    .diaryDate(diaryModel.getDiaryDate() != null ? diaryModel.getDiaryDate() : existing.getDiaryDate())
                    .title(diaryModel.getTitle() != null ? diaryModel.getTitle() : existing.getTitle())
                    .content(diaryModel.getContent() != null ? diaryModel.getContent() : existing.getContent())
                    .userId(diaryModel.getUserId() != null ? diaryModel.getUserId() : existing.getUserId())
                    .build();
            
            Diary saved = diaryRepository.save(updated);
            DiaryModel model = entityToModel(saved);
            return Messenger.builder()
                    .Code(200)
                    .message("수정 성공: " + diaryModel.getId())
                    .data(model)
                    .build();
        } else {
            return Messenger.builder()
                    .Code(404)
                    .message("수정할 일기를 찾을 수 없습니다.")
                    .build();
        }
    }

    @Override
    @Transactional
    public Messenger delete(DiaryModel diaryModel) {
        if (diaryModel.getId() == null) {
            return Messenger.builder()
                    .Code(400)
                    .message("ID가 필요합니다.")
                    .build();
        }
        Optional<Diary> optionalEntity = diaryRepository.findById(diaryModel.getId());
        if (optionalEntity.isPresent()) {
            diaryRepository.deleteById(diaryModel.getId());
            return Messenger.builder()
                    .Code(200)
                    .message("삭제 성공: " + diaryModel.getId())
                    .build();
        } else {
            return Messenger.builder()
                    .Code(404)
                    .message("삭제할 일기를 찾을 수 없습니다.")
                    .build();
        }
    }

}

