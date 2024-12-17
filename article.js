import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

function asyncHandler(handler) {
    return async function (req, res) {
        try {
            await handler(req, res);

        } catch (err) {
            if (err.name === 'ValidationError') {
                res.status(400).send({ message: err.message });
            } else if (err.name === 'CastError') {
                res.status(404).send({ message: 'article not found' });
            } else {
                res.status(500).send({ message: err.message });
            }
        }
    }
}

// app.get('/articles', asyncHandler(async (req, res) => {
//     const articles = await prisma.article.findMany();
//     res.json(articles);
//     }));

app.get('/articles', asyncHandler(async (req, res) => {
    const { sort, page = 1, limit = 10, search = "" } = req.query;

    const skip = (page - 1) * limit;

    const searchQuery = {
        OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } }
        ]
    };

    const sortOptions = { 
        createdAt: sort === 'recent' ? 'desc' : 'asc'
    };

    const articles = await prisma.article.findMany({
        where: searchQuery,
        orderBy: sortOptions,
        skip: skip,
        take: parseInt(limit),
        select: {
            id: true,
            title: true,
            content: true,
            createdAt: true
        }
    });

    const total = await prisma.article.count({
        where: searchQuery
    });

    res.send({
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        articles,
    });
}));

app.get('/articles/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const article = await prisma.article.findUnique({
        where: { id },
    });
    res.json(article);
}));

app.post('/articles', asyncHandler(async (req, res) => {
    const { title, content } = req.body;
    const article = await prisma.article.create({
        data: {
            title,
            content,
        },
    });
    res.json(article);
}));

app.patch('/articles/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const article = await prisma.article.update({
        where: { id },
        data: {
            title,
            content,
        },
    });
    res.json(article);
}));

app.delete('/articles/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const article = await prisma.article.delete({
        where: { id },
    });
    res.json(article);
}));

const runningPort = process.env.PORT || 3000;
app.listen(runningPort, () => {
    console.log(`Server is running on http://localhost:${runningPort}`);
});