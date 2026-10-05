import type { Goal } from '../types/goal';

export const SAMPLE_GOAL: Goal = {
  id: 'goal-learn-python-sample',
  name: 'Learn Python',
  totalDays: 7,
  createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  category: 'Programming',
  days: [
    {
      dayNumber: 1,
      topic: 'Python Basics & Environment Setup',
      completed: true,
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      resources: [
        {
          id: 'res-1-1',
          url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
          type: 'youtube',
          title: 'Python for Beginners (Full Course)',
        },
        {
          id: 'res-1-2',
          url: 'https://www.hackerrank.com/domains/python',
          type: 'practice',
          title: 'HackerRank Python Setup Practice',
        },
      ],
      log: {
        text: 'Installed Python 3.12 and configured VS Code. Wrote my first script and tested basic I/O with input() and print().',
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
    {
      dayNumber: 2,
      topic: 'Variables, Data Types & Type Casting',
      completed: true,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      resources: [
        {
          id: 'res-2-1',
          url: 'https://youtu.be/khKv-8q7YmY',
          type: 'youtube',
          title: 'Understanding Python Variables & Memory',
        },
        {
          id: 'res-2-2',
          url: 'https://leetcode.com/problemset/all/',
          type: 'practice',
          title: 'LeetCode Basic Syntax Exercises',
        },
      ],
      log: {
        text: 'Practiced integers, floats, string manipulation methods (.strip(), .lower(), .replace()), and formatted strings (f-strings).',
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
    {
      dayNumber: 3,
      topic: 'Control Flow: Conditionals & Loops',
      completed: true,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      resources: [
        {
          id: 'res-3-1',
          url: 'https://www.hackerrank.com/challenges/py-if-else/problem',
          type: 'practice',
          title: 'Python If-Else Problem',
        },
        {
          id: 'res-3-2',
          url: 'https://docs.python.org/3/tutorial/controlflow.html',
          type: 'generic',
          title: 'Official Docs on Control Flow',
        },
      ],
      log: {
        text: 'Solved 5 conditional problems. Got comfortable with nested loops, range() intervals, and while loop exit conditions.',
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
    {
      dayNumber: 4,
      topic: 'Functions, Parameters & Scope',
      completed: true,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      resources: [
        {
          id: 'res-4-1',
          url: 'https://www.youtube.com/watch?v=9Os0o3wzS_I',
          type: 'youtube',
          title: 'Python Functions & Scope Deep Dive',
        },
        {
          id: 'res-4-2',
          url: 'https://exercism.org/tracks/python',
          type: 'practice',
          title: 'Exercism Python Track',
        },
      ],
      log: {
        text: 'Learned default arguments, *args and **kwargs, lambda expressions, and scope (LEGB rule: Local, Enclosing, Global, Built-in).',
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
    {
      dayNumber: 5,
      topic: 'Data Structures: Lists, Tuples & Dictionaries',
      completed: false,
      resources: [
        {
          id: 'res-5-1',
          url: 'https://practice.geeksforgeeks.org/explore',
          type: 'practice',
          title: 'GeeksforGeeks Practice DS',
        },
        {
          id: 'res-5-2',
          url: 'https://docs.python.org/3/tutorial/datastructures.html',
          type: 'generic',
          title: 'Python Data Structures Guide',
        },
      ],
    },
    {
      dayNumber: 6,
      topic: 'Object-Oriented Programming (Classes & Inheritance)',
      completed: false,
      resources: [
        {
          id: 'res-6-1',
          url: 'https://www.youtube.com/watch?v=JeznW_70Znx',
          type: 'youtube',
          title: 'Object-Oriented Programming with Python',
        },
        {
          id: 'res-6-2',
          url: 'https://codeforces.com/problemset',
          type: 'practice',
          title: 'Codeforces Practice',
        },
      ],
    },
    {
      dayNumber: 7,
      topic: 'Mini-Project: Interactive CLI Goal Tracker',
      completed: false,
      resources: [
        {
          id: 'res-7-1',
          url: 'https://github.com',
          type: 'generic',
          title: 'GitHub Starter Template',
        },
        {
          id: 'res-7-2',
          url: 'https://neetcode.io/practice',
          type: 'practice',
          title: 'NeetCode Practice',
        },
      ],
    },
  ],
};
