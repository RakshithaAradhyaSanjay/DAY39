

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

mongoose.connect('localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,

});


// API endpoint to create a mentor
app.post('/create-mentor', async (req, res) => {
  try {
    const { name, specialization } = req.body;
    const mentor = await Mentor.create({ name, specialization });
    res.status(201).json({ message: 'Mentor created successfully', mentor });
  } catch (error) {
    res.status(500).json({ error: 'Error creating mentor' });
  }
});

// API endpoint to create a student
app.post('/create-student', async (req, res) => {
  try {
    const { name, age } = req.body;
    const student = await Student.create({ name, age });
    res.status(201).json({ message: 'Student created successfully', student });
  } catch (error) {
    res.status(500).json({ error: 'Error creating student' });
  }
});

// API endpoint to assign students to a mentor
app.post('/assign-students', async (req, res) => {
    try {
      const { mentorId, studentIds } = req.body;
  
      // Check if the mentor exists
      const mentor = await Mentor.findById(mentorId);
      if (!mentor) {
        return res.status(404).json({ error: 'Mentor not found' });
      }
  
      // Filter out students who already have a mentor
      const unassignedStudents = await Student.find({
        _id: { $in: studentIds },
        mentorId: { $exists: false },
      });
  
      // Update student documents with the assigned mentor ID
      await Student.updateMany(
        { _id: { $in: unassignedStudents.map((s) => s._id) } },
        { $set: { mentorId } }
      );
  
      res.status(200).json({ message: 'Students assigned successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error assigning students' });
    }
  });

// API endpoint to assign or change mentor for a student
app.post('/assign-mentor', async (req, res) => {
    try {
      const { studentId, mentorId } = req.body;
  
      // Check if the student exists
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
  
      // Check if the mentor exists
      const mentor = await Mentor.findById(mentorId);
      if (!mentor) {
        return res.status(404).json({ error: 'Mentor not found' });
      }
  
      // Update the student's mentor ID
      student.mentorId = mentorId;
      await student.save();
  
      res.status(200).json({ message: 'Mentor assigned successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error assigning mentor' });
    }
  });

  // API endpoint to show all students for a particular mentor
app.get('/mentor-students/:mentorId', async (req, res) => {
    try {
      const mentorId = req.params.mentorId;
  
      // Check if the mentor exists
      const mentor = await Mentor.findById(mentorId);
      if (!mentor) {
        return res.status(404).json({ error: 'Mentor not found' });
      }
  
      // Find all students assigned to this mentor
      const studentsForMentor = await Student.find({ mentorId });
  
      res.status(200).json({ students: studentsForMentor });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching students for mentor' });
    }
  });

  // API endpoint to show previously assigned mentor for a student
app.get('/student-mentor/:studentId', async (req, res) => {
    try {
      const studentId = req.params.studentId;
  
      // Check if the student exists
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
  
      // Find the mentor assigned to this student (if any)
      const mentor = await Mentor.findById(student.mentorId);
  
      res.status(200).json({ mentor });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching mentor for student' });
    }
  });

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
