import bcrypt from 'bcrypt'

export class PasswordHasher {

  public static async hash(plainText: string): Promise<string> {
    return await bcrypt.hash(plainText, 10)
  }

  public static async verificar(plainText: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plainText, hash);
  }
}