/**
 * Recorta o centro da imagem em um quadrado, reduz para `size` x `size` e devolve um JPEG.
 * Roda no navegador, antes do envio: a foto fica com poucos KB e sem metadados (EXIF/GPS).
 * Imagens com transparência (PNG) ganham fundo branco, já que JPEG não tem transparência.
 */
export async function resizeToSquareJpeg(file: Blob, size = 256, quality = 0.85): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Não foi possível ler a imagem. Tente outra foto (JPG, PNG ou WebP).'))
      el.src = url
    })

    const side = Math.min(img.naturalWidth, img.naturalHeight)
    const sx = (img.naturalWidth - side) / 2
    const sy = (img.naturalHeight - side) / 2

    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Seu navegador não conseguiu processar a imagem.')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)
    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)

    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao processar a imagem.'))),
        'image/jpeg',
        quality,
      ),
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}
