import type { ReactNode } from "react";
import type { Metadata } from 'next';
import './auth.css';
export const metadata: Metadata = { title: 'Galung.id — Akun pelanggan' };
export default function Layout({ children }: { children: ReactNode }) { return <html lang="id"><body>{children}</body></html>; }
