import { QRCodeSVG } from 'qrcode.react'

export default function QRDisplay({ value }) {
  return <QRCodeSVG value={value} size={200} />
}
