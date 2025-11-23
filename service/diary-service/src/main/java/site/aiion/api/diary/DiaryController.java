package site.aiion.api.diary;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import site.aiion.api.diary.common.domain.Messenger;

@RestController
@RequiredArgsConstructor
@RequestMapping("/diaries")
@Tag(name = "01. Diary", description = "일기 관리 기능")
public class DiaryController {

    private final DiaryService diaryService;

    @PostMapping("/findById")
    @Operation(summary = "일기 ID로 조회", description = "일기 ID를 받아 해당 일기 정보를 조회합니다.")
    public Messenger findById(@RequestBody DiaryModel diaryModel) {
        return diaryService.findById(diaryModel);
    }

    @GetMapping
    @Operation(summary = "전체 일기 조회", description = "모든 일기 정보를 조회합니다.")
    public Messenger findAll() {
        return diaryService.findAll();
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "사용자별 일기 조회", description = "특정 사용자의 일기 정보를 조회합니다.")
    public Messenger findByUserId(@org.springframework.web.bind.annotation.PathVariable Long userId) {
        return diaryService.findByUserId(userId);
    }

    @GetMapping("/check/{userId}")
    @Operation(summary = "사용자별 일기 연결 확인", description = "특정 사용자의 일기 연결 상태를 확인합니다.")
    public Messenger checkUserDiaryConnection(@org.springframework.web.bind.annotation.PathVariable Long userId) {
        return diaryService.findByUserId(userId);
    }

    @PostMapping
    @Operation(summary = "일기 저장", description = "새로운 일기 정보를 저장합니다.")
    public Messenger save(@RequestBody DiaryModel diaryModel) {
        return diaryService.save(diaryModel);
    }

    @PostMapping("/saveAll")
    @Operation(summary = "일기 일괄 저장", description = "여러 일기 정보를 한 번에 저장합니다.")
    public Messenger saveAll(@RequestBody List<DiaryModel> diaryModelList) {
        return diaryService.saveAll(diaryModelList);
    }

    @PutMapping
    @Operation(summary = "일기 수정", description = "기존 일기 정보를 수정합니다.")
    public Messenger update(@RequestBody DiaryModel diaryModel) {
        return diaryService.update(diaryModel);
    }

    @DeleteMapping
    @Operation(summary = "일기 삭제", description = "일기 정보를 삭제합니다.")
    public Messenger delete(@RequestBody DiaryModel diaryModel) {
        return diaryService.delete(diaryModel);
    }

}

