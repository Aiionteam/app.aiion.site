package site.aiion.api.calendar;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import site.aiion.api.calendar.common.domain.Messenger;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class CalendarServiceImpl implements CalendarService {

    private final CalendarRepository calendarRepository;

    private CalendarModel entityToModel(Calendar entity) {
        return CalendarModel.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .color(entity.getColor())
                .timezone(entity.getTimezone())
                .userId(entity.getUserId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private Calendar modelToEntity(CalendarModel model) {
        LocalDateTime now = LocalDateTime.now();
        return Calendar.builder()
                .id(model.getId())
                .name(model.getName())
                .description(model.getDescription())
                .color(model.getColor())
                .timezone(model.getTimezone())
                .userId(model.getUserId())
                .createdAt(model.getCreatedAt() != null ? model.getCreatedAt() : now)
                .updatedAt(model.getUpdatedAt() != null ? model.getUpdatedAt() : now)
                .build();
    }

    @Override
    public Messenger findById(CalendarModel calendarModel) {
        if (calendarModel.getId() == null) {
            return Messenger.builder()
                    .Code(400)
                    .message("ID가 필요합니다.")
                    .build();
        }
        Optional<Calendar> entity = calendarRepository.findById(calendarModel.getId());
        if (entity.isPresent()) {
            CalendarModel model = entityToModel(entity.get());
            return Messenger.builder()
                    .Code(200)
                    .message("조회 성공")
                    .data(model)
                    .build();
        } else {
            return Messenger.builder()
                    .Code(404)
                    .message("캘린더를 찾을 수 없습니다.")
                    .build();
        }
    }

    @Override
    public Messenger findAll() {
        List<Calendar> entities = calendarRepository.findAll();
        List<CalendarModel> modelList = entities.stream()
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
    public Messenger save(CalendarModel calendarModel) {
        if (calendarModel.getName() == null || calendarModel.getName().trim().isEmpty()) {
            return Messenger.builder()
                    .Code(400)
                    .message("캘린더 이름은 필수 값입니다.")
                    .build();
        }
        Calendar entity = modelToEntity(calendarModel);
        Calendar saved = calendarRepository.save(entity);
        CalendarModel model = entityToModel(saved);
        return Messenger.builder()
                .Code(200)
                .message("저장 성공: " + saved.getId())
                .data(model)
                .build();
    }

    @Override
    @Transactional
    public Messenger saveAll(List<CalendarModel> calendarModelList) {
        List<Calendar> entities = calendarModelList.stream()
                .map(this::modelToEntity)
                .collect(Collectors.toList());
        
        List<Calendar> saved = calendarRepository.saveAll(entities);
        return Messenger.builder()
                .Code(200)
                .message("일괄 저장 성공: " + saved.size() + "개")
                .build();
    }

    @Override
    @Transactional
    public Messenger update(CalendarModel calendarModel) {
        if (calendarModel.getId() == null) {
            return Messenger.builder()
                    .Code(400)
                    .message("ID가 필요합니다.")
                    .build();
        }
        Optional<Calendar> optionalEntity = calendarRepository.findById(calendarModel.getId());
        if (optionalEntity.isPresent()) {
            Calendar existing = optionalEntity.get();
            
            Calendar updated = Calendar.builder()
                    .id(existing.getId())
                    .name(calendarModel.getName() != null ? calendarModel.getName() : existing.getName())
                    .description(calendarModel.getDescription() != null ? calendarModel.getDescription() : existing.getDescription())
                    .color(calendarModel.getColor() != null ? calendarModel.getColor() : existing.getColor())
                    .timezone(calendarModel.getTimezone() != null ? calendarModel.getTimezone() : existing.getTimezone())
                    .userId(calendarModel.getUserId() != null ? calendarModel.getUserId() : existing.getUserId())
                    .createdAt(existing.getCreatedAt())
                    .updatedAt(LocalDateTime.now())
                    .build();
            
            Calendar saved = calendarRepository.save(updated);
            CalendarModel model = entityToModel(saved);
            return Messenger.builder()
                    .Code(200)
                    .message("수정 성공: " + calendarModel.getId())
                    .data(model)
                    .build();
        } else {
            return Messenger.builder()
                    .Code(404)
                    .message("수정할 캘린더를 찾을 수 없습니다.")
                    .build();
        }
    }

    @Override
    @Transactional
    public Messenger delete(CalendarModel calendarModel) {
        if (calendarModel.getId() == null) {
            return Messenger.builder()
                    .Code(400)
                    .message("ID가 필요합니다.")
                    .build();
        }
        Optional<Calendar> optionalEntity = calendarRepository.findById(calendarModel.getId());
        if (optionalEntity.isPresent()) {
            calendarRepository.deleteById(calendarModel.getId());
            return Messenger.builder()
                    .Code(200)
                    .message("삭제 성공: " + calendarModel.getId())
                    .build();
        } else {
            return Messenger.builder()
                    .Code(404)
                    .message("삭제할 캘린더를 찾을 수 없습니다.")
                    .build();
        }
    }

}

