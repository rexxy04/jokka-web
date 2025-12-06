import { redirect } from 'next/navigation';

export default function AdminRootPage() {
  // Begitu user buka /admin, langsung lempar ke dashboard
  redirect('/admin/dashboard');
}