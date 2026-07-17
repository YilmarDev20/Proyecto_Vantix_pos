package com.vantix.pos.modules.audit.mapper;

import com.vantix.pos.modules.audit.dto.AuditoriaLogDTO;
import com.vantix.pos.modules.audit.entity.AuditoriaLog;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuditoriaMapper {
    AuditoriaLogDTO toDto(AuditoriaLog entity);
}