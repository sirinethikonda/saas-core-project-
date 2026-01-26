package com.saas.platform.modules.project;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.saas.platform.core.common.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    // API 12: Create Project
    @PostMapping
    public ApiResponse<?> create(@RequestBody Project project) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return projectService.createProject(project, userId);
    }

    // API 13: List Projects
    @GetMapping
    public ApiResponse<?> list() {
        return ApiResponse.success("Projects fetched", projectService.listAllProjects());
    }

    // API: Get Single Project (Missing before)
    @GetMapping("/{id}")
    public ApiResponse<?> get(@PathVariable String id) {
        return projectService.getProject(id);
    }

    // API 14: Update Project
    @PutMapping("/{id}")
    public ApiResponse<?> update(@PathVariable String id, @RequestBody Project project) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return projectService.updateProject(id, project, userId);
    }

    // API 15: Delete Project
    @DeleteMapping("/{id}")
    public ApiResponse<?> delete(@PathVariable String id) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        projectService.deleteProject(id, userId);
        return ApiResponse.success("Project deleted successfully", null);
    }
}