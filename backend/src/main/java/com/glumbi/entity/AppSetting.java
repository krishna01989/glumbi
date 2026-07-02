package com.glumbi.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "app_settings")
@Data
@NoArgsConstructor
public class AppSetting {

    @Id
    @Column(length = 100)
    private String key;

    @Column(nullable = false, length = 500)
    private String value;
}
