import { redirect } from 'next/navigation'

export default function ForgotPasswordPage() {
  // Clerk handles password reset automatically via the sign-in flow
  redirect('/sign-in')
}
