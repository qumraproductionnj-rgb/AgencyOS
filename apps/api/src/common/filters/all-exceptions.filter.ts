import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common'
import type { Request, Response } from 'express'

interface ProblemDetails {
  type: string
  title: string
  status: number
  detail?: string
  instance: string
  errors?: unknown
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    const httpResponse = exception instanceof HttpException ? exception.getResponse() : null

    const message =
      exception instanceof HttpException
        ? exception.message
        : exception instanceof Error
          ? exception.message
          : 'Internal server error'

    const problem: ProblemDetails = {
      type: `https://httpstatuses.com/${String(status)}`,
      title: this.statusToTitle(status),
      status,
      detail: message,
      instance: request.url,
    }

    if (httpResponse !== null && typeof httpResponse === 'object' && 'message' in httpResponse) {
      problem.errors = (httpResponse as { message: unknown }).message
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} → ${String(status)}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      )
    }

    response.status(status).type('application/problem+json').json(problem)
  }

  private statusToTitle(status: number): string {
    const map: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      503: 'Service Unavailable',
    }
    return map[status] ?? 'Error'
  }
}
