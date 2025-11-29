package site.aiion.api.calendar;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class CalendarModel {
    private Long id;
    private String name;
    private String description;
    private String color;
    private String timezone;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

