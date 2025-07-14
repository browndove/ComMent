
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoginSchema, type LoginInput } from '@/lib/schemas';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export function LoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);


  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginInput) {
    setIsSubmitting(true);
    try {
      const userRole = await login(values);
      toast({
        title: 'Login Successful',
        description: 'Welcome back! Redirecting you to your dashboard...',
      });
      
      // Redirect based on role
      if (userRole === 'student') {
        router.push('/student/dashboard');
      } else if (userRole === 'counselor') {
        router.push('/counselor/dashboard');
      } else {
         // Fallback, though should not be reached if roles are set correctly
        router.push('/');
      }

    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An unknown error occurred. Please try again.',
      });
       setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="name@university.ac.uk" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center text-sm">
        <p>
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Register here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
