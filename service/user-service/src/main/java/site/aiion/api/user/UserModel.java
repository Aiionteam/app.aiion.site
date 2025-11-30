package site.aiion.api.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class UserModel {
    private Long id;
    
    private String name;
    
    private String email;
    
    private String password;
}
