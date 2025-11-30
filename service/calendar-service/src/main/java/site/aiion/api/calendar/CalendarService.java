package site.aiion.api.calendar;

import java.util.List;
import site.aiion.api.calendar.common.domain.Messenger;

public interface CalendarService {
    public Messenger findById(CalendarModel calendarModel);
    public Messenger findAll();
    public Messenger save(CalendarModel calendarModel);
    public Messenger saveAll(List<CalendarModel> calendarModelList);
    public Messenger update(CalendarModel calendarModel);
    public Messenger delete(CalendarModel calendarModel);
}

