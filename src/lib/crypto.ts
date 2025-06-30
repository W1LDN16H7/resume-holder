export class CryptoService {
  private static encoder = new TextEncoder()
  private static decoder = new TextDecoder()

  static async generateSalt(): Promise<Uint8Array> {
    return crypto.getRandomValues(new Uint8Array(16))
  }

  static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey("raw", this.encoder.encode(password), "PBKDF2", false, [
      "deriveBits",
      "deriveKey",
    ])

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    )
  }

  static async hashPassword(password: string, salt: Uint8Array): Promise<string> {
    const key = await crypto.subtle.importKey("raw", this.encoder.encode(password), "PBKDF2", false, ["deriveBits"])

    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      256,
    )

    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  }

  static async encrypt(data: string, password: string): Promise<{ encrypted: string; iv: string }> {
    const salt = await this.generateSalt()
    const key = await this.deriveKey(password, salt)
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, this.encoder.encode(data))

    return {
      encrypted: Array.from(new Uint8Array(encrypted))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
      iv:
        Array.from(iv)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("") +
        Array.from(salt)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
    }
  }

  static async decrypt(encryptedData: string, iv: string, password: string): Promise<string> {
    const ivBytes = new Uint8Array(
      iv
        .match(/.{1,2}/g)!
        .slice(0, 12)
        .map((byte) => Number.parseInt(byte, 16)),
    )
    const saltBytes = new Uint8Array(
      iv
        .match(/.{1,2}/g)!
        .slice(12)
        .map((byte) => Number.parseInt(byte, 16)),
    )

    const key = await this.deriveKey(password, saltBytes)
    const encryptedBytes = new Uint8Array(encryptedData.match(/.{1,2}/g)!.map((byte) => Number.parseInt(byte, 16)))

    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBytes }, key, encryptedBytes)

    return this.decoder.decode(decrypted)
  }

  static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ""
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }
}
