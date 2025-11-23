package site.aiion.api.diary;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class DiaryModel {
    private Long id;
    private LocalDate diaryDate;
    private String title;
    private String content;
    private Long userId;
}

