import SocialIcons from './SocialIcons'

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-neutral-600">© {new Date().getFullYear()} Cake N Crush · All rights reserved.</p>
        <SocialIcons />
      </div>
    </footer>
  )
}
