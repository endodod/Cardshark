import { VT323 } from 'next/font/google'
import "./globals.css";
import MuteButton from '@/components/MuteButton'

const vt323 = VT323({ weight: '400', subsets: ['latin'] })

export const metadata = {
  title: "CARDSHARK v1.0",
  description: "A retro terminal blackjack game",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={vt323.className}>
      <body>
        <div className='bg-black min-h-screen flex items-center justify-center'>
          <div className='bg-[#1a1a1a] rounded-xl shadow-2xl' style={{ maxWidth: '1600px', width: '97vw', padding: '20px 28px' }}>

            {/* Title bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <div style={{
                color: '#f0c040',
                fontSize: 'clamp(48px, 6vw, 80px)',
                fontFamily: 'inherit',
                letterSpacing: '0.12em',
                lineHeight: 1,
              }}>
                CARDSHARK
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#444', fontSize: 'clamp(14px, 1.4vw, 18px)' }}>v1.0</span>
                <MuteButton />
              </div>
            </div>

            {/* Console window — fixed height */}
            <div
              className='bg-[#0a0a0a] rounded crt vignette'
              style={{
                padding: '32px 40px',
                height: 'clamp(700px, 90vh, 1400px)',
                overflow: 'hidden',
                fontSize: 'clamp(26px, 2.6vw, 40px)',
              }}
            >
              {children}
            </div>

          </div>
        </div>
      </body>
    </html>
  );
}
