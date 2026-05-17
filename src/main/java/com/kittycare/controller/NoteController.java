package com.kittycare.controller;

import com.kittycare.model.Note;
import com.kittycare.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:8081")
public class NoteController {

    @Autowired
    private NoteRepository noteRepository;

    @GetMapping("/{userId}")
    public List<Note> getNotes(@PathVariable Long userId) {
        return noteRepository.findByUserIdOrderByDateDesc(userId);
    }

    @PostMapping
    public Note addNote(@RequestBody Note note) {
        note.setId(null);
        return noteRepository.save(note);
    }

    @DeleteMapping("/{id}")
    public void deleteNote(@PathVariable Long id) {
        noteRepository.deleteById(id);
    }
}