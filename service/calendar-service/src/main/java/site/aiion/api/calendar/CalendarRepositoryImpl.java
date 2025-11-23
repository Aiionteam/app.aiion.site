package site.aiion.api.calendar;

import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CalendarRepositoryImpl implements CalendarRepositoryCustom {
    private final JPAQueryFactory queryFactory;
}

