import { Injectable } from '@nestjs/common'
import * as argon2 from 'argon2'

/**
 * Argon2id password hashing per ADR-002.
 * Parameters: memory=64MB, iterations=3, parallelism=4 (OWASP recommended).
 */
@Injectable()
export class PasswordService {
  private readonly options: argon2.Options = {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  }

  hash(plain: string): Promise<string> {
    return argon2.hash(plain, this.options)
  }

  verify(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain)
  }
}
