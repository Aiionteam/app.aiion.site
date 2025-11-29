package site.aiion.api.calendar;

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
import site.aiion.api.calendar.common.domain.Messenger;

@RestController
@RequiredArgsConstructor
@RequestMapping("/calendars")
@Tag(name = "01. Calendar", description = "캘린더 관리 기능")
public class CalendarController {

    private final CalendarService calendarService;

    @PostMapping("/findById")
    @Operation(summary = "캘린더 ID로 조회", description = "캘린더 ID를 받아 해당 캘린더 정보를 조회합니다.")
    public Messenger findById(@RequestBody CalendarModel calendarModel) {
        return calendarService.findById(calendarModel);
    }

    @GetMapping
    @Operation(summary = "전체 캘린더 조회", description = "모든 캘린더 정보를 조회합니다.")
    public Messenger findAll() {
        return calendarService.findAll();
    }

    @PostMapping
    @Operation(summary = "캘린더 저장", description = "새로운 캘린더 정보를 저장합니다.")
    public Messenger save(@RequestBody CalendarModel calendarModel) {
        return calendarService.save(calendarModel);
    }

    @PostMapping("/saveAll")
    @Operation(summary = "캘린더 일괄 저장", description = "여러 캘린더 정보를 한 번에 저장합니다.")
    public Messenger saveAll(@RequestBody List<CalendarModel> calendarModelList) {
        return calendarService.saveAll(calendarModelList);
    }

    @PutMapping
    @Operation(summary = "캘린더 수정", description = "기존 캘린더 정보를 수정합니다.")
    public Messenger update(@RequestBody CalendarModel calendarModel) {
        return calendarService.update(calendarModel);
    }

    @DeleteMapping
    @Operation(summary = "캘린더 삭제", description = "캘린더 정보를 삭제합니다.")
    public Messenger delete(@RequestBody CalendarModel calendarModel) {
        return calendarService.delete(calendarModel);
    }

}

