const request = require('supertest');
const app = require('../../app');
const Quiz = require('../../models/Quiz');
const User = require('../../models/User');
const mongoose = require('mongoose');

describe('Quiz Flow', () => {
  let teacherToken;
  let studentToken;
  let quizId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);
    
    // Create test users
    const teacher = await User.create({
      name: 'Test Teacher',
      email: 'teacher@test.com',
      password: 'password123',
      role: 'teacher'
    });

    const student = await User.create({
      name: 'Test Student',
      email: 'student@test.com',
      password: 'password123',
      role: 'student'
    });

    // Get tokens
    const teacherRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'teacher@test.com', password: 'password123' });
    
    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@test.com', password: 'password123' });

    teacherToken = teacherRes.body.token;
    studentToken = studentRes.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('complete quiz flow', async () => {
    // 1. Teacher creates quiz
    const createQuizRes = await request(app)
      .post('/api/quizzes')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Test Quiz',
        questions: [
          {
            text: 'What is 2+2?',
            options: ['3', '4', '5', '6'],
            correctOption: 1
          }
        ]
      });
    
    expect(createQuizRes.statusCode).toBe(201);
    quizId = createQuizRes.body._id;

    // 2. Student joins quiz
    const joinQuizRes = await request(app)
      .post('/api/quizzes/join')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ accessCode: createQuizRes.body.accessCode });
    
    expect(joinQuizRes.statusCode).toBe(200);

    // 3. Student submits quiz
    const submitQuizRes = await request(app)
      .post(`/api/quizzes/${quizId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: [1]
      });
    
    expect(submitQuizRes.statusCode).toBe(200);
    expect(submitQuizRes.body.score).toBe(100);
  });
}); 