import { ReactNode } from 'react';
import Link from 'next/link';
import { Home, Users, Briefcase, FileText } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">Admin</h1>
        <nav>
          <ul>
            <li className="mb-4">
              <Link href="/admin" className="flex items-center gap-3 hover:text-gray-300">
                <Home className="w-5 h-5" />
                Dashboard
              </Link>
            </li>
            <li className="mb-4">
              <Link href="/admin/users" className="flex items-center gap-3 hover:text-gray-300">
                <Users className="w-5 h-5" />
                Users
              </Link>
            </li>
            <li className="mb-4">
              <Link href="/admin/services" className="flex items-center gap-3 hover:text-gray-300">
                <Briefcase className="w-5 h-5" />
                Services
              </Link>
            </li>
            <li className="mb-4">
              <Link href="/admin/orders" className="flex items-center gap-3 hover:text-gray-300">
                <FileText className="w-5 h-5" />
                Orders
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-gray-100">
        {children}
      </main>
    </div>
  );
}
