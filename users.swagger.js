/**
 * @swagger
 * /users/sign-in:
 *  post:
 *    summary: 회원 가입
 *    description: 회원 가입
 *    tags: [User]
 *    responses:
 *      201:
 *        description: 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: string
 *                  example: "uuid"
 *                nickname:
 *                  type: string
 *                  example: "닉네임"
 *                email:
 *                  type: string
 *                  example: "test@test.com"
 *                point:
 *                  point: int
 *                  example: 1000
 *                createdAt:
 *                  type: string
 *                  example: "2025-02-10T10:30:33.389Z"
 */

/**
 * @swagger
 * /users/log-in:
 *  post:
 *    summary: 로그인
 *    description: 로그인
 *    tags: [User]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                example: "test@test.com"
 *              password:
 *                type: string
 *                example: "password"
 *    responses:
 *      200:
 *        description: 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                accessToken:
 *                  type: string
 *                  example: "token"
 *                refreshToken:
 *                  type: string
 *                  example: "token"
 */

/**
 * @swagger
 * /users/refresh-token:
 *  post:
 *    summary: 토큰 갱신
 *    description: 토큰 생신
 *    tags: [User]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              refreshToken:
 *                type: string
 *                example: "token"
 *    responses:
 *      200:
 *        description: 성공
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                accessToken:
 *                  type: string
 *                  example: "token"
 *                refreshToken:
 *                  type: string
 *                  example: "token"
 */
