import React, { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/use-auth'
import {
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  Home,
  MapPin,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

const signupSchema = z
  .object({
    fullName: z.string().min(3, 'Full name must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
    dob: z
      .string()
      .refine(
        val => !val || (new Date(val) <= new Date(new Date().setFullYear(new Date().getFullYear() - 13))),
        'You must be at least 13 years old',
      ).optional(),
    address: z.string().min(3, 'Address must be at least 3 characters').optional(),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    pincode: z.string().min(5, 'Pincode must be at least 5 characters'),
    secretCode: z.string().optional(),
    termsAccepted: z.boolean().refine(val => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type LoginFormValues = z.infer<typeof loginSchema>
type SignupFormValues = z.infer<typeof signupSchema>

// Step Configuration
const userStepConfig = [
  {
    title: 'Account Details',
    icon: <User className='h-5 w-5' />,
    fields: ['fullName', 'email', 'password', 'confirmPassword'],
  },
  {
    title: 'Personal Info',
    icon: <FileText className='h-5 w-5' />,
    fields: ['dob', 'phone', 'address'],
  },
  {
    title: 'Location & Terms',
    icon: <MapPin className='h-5 w-5' />,
    fields: ['city', 'state', 'pincode', 'termsAccepted'],
  },
]

const adminStepConfig = [
  {
    title: 'Account Details',
    icon: <User className='h-5 w-5' />,
    fields: ['fullName', 'email', 'password', 'confirmPassword'],
  },
  {
    title: 'Location',
    icon: <MapPin className='h-5 w-5' />,
    fields: ['city', 'state', 'pincode'],
  },
  {
    title: 'Verification & Terms',
    icon: <ShieldCheck className='h-5 w-5' />,
    fields: ['secretCode', 'termsAccepted'],
  },
]

// Component
interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'login' | 'signup'
  userType: 'user' | 'admin'
  onSwitchType: (
    newModalType: 'login' | 'signup',
    newUserType: 'user' | 'admin',
  ) => void
}

const ProgressBar = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number
  totalSteps: number
}) => {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100
  return (
    <div className='w-full bg-gray-200 rounded-full h-1.5 mb-4'>
      <div
        className='bg-primary h-1.5 rounded-full transition-all duration-300'
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  type,
  userType,
  onSwitchType,
}) => {
  const { login, register, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const currentConfig = userType === 'admin' ? adminStepConfig : userStepConfig
  const totalSteps = currentConfig.length
  const currentStepInfo = currentConfig[step - 1]

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      dob: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      secretCode: '',
      termsAccepted: false,
    },
  })

  const handleNext = async () => {
    const isValid = await signupForm.trigger(currentStepInfo.fields as any)
    if (isValid && step < totalSteps) {
      setStep(prev => prev + 1)
    }
  }

  const handleBack = () => setStep(prev => prev - 1)

  const onLoginSubmit = async (values: LoginFormValues) => {
    setError(null)
    try {
      await login({
        email: values.email,
        password: values.password,
        role: userType,
      })
      handleClose()
    } catch (err: any) {
      let errorMessage = 'Failed to login.';
      try {
        const errorJson = JSON.parse(err.message);
        errorMessage = errorJson.message || errorMessage;
      } catch (e) {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
    }
  }

  const onSignupSubmit = async (values: SignupFormValues) => {
    setError(null)
    try {
      const { confirmPassword, ...registerData } = values
      await register({ ...registerData, role: userType })
      handleClose()
    } catch (err: any) {
      let errorMessage = 'Failed to register.';
      try {
        const errorJson = JSON.parse(err.message);
        errorMessage = errorJson.message || errorMessage;
      } catch (e) {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
    }
  }

  const handleClose = () => {
    setError(null)
    setStep(1)
    setShowPassword(false)
    setShowConfirmPassword(false)
    loginForm.reset()
    signupForm.reset()
    onClose()
  }

  const renderSignupStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className='space-y-4'>
            <FormField
              control={signupForm.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                      <Input
                        placeholder='John Doe'
                        {...field}
                        className='pl-10'
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={signupForm.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                      <Input
                        type='email'
                        placeholder='your@email.com'
                        {...field}
                        className='pl-10'
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <FormField
                control={signupForm.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder='••••••••'
                          {...field}
                          className='pl-10 pr-10'
                        />
                        <button
                          type='button'
                          onClick={() => setShowPassword(!showPassword)}
                          className='absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer'
                          aria-label={
                            showPassword ? 'Hide password' : 'Show password'
                          }
                        >
                          {showPassword ? (
                            <EyeOff className='h-4 w-4 text-gray-400' />
                          ) : (
                            <Eye className='h-4 w-4 text-gray-400' />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder='••••••••'
                          {...field}
                          className='pl-10 pr-10'
                        />
                        <button
                          type='button'
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className='absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer'
                          aria-label={
                            showConfirmPassword
                              ? 'Hide password'
                              : 'Show password'
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className='h-4 w-4 text-gray-400' />
                          ) : (
                            <Eye className='h-4 w-4 text-gray-400' />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )
      case 2:
        if (userType === 'admin') {
          return (
            <div className='space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <FormField
                  control={signupForm.control}
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <MapPin className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                          <Input
                            placeholder='City'
                            {...field}
                            className='pl-10'
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name='state'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <MapPin className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                          <Input
                            placeholder='State'
                            {...field}
                            className='pl-10'
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name='pincode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <MapPin className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                          <Input
                            placeholder='123456'
                            {...field}
                            className='pl-10'
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )
        }
        return (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <FormField
                control={signupForm.control}
                name='dob'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Calendar className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <Input type='date' {...field} className='pl-10' />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Phone className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <Input
                          placeholder='(123) 456-7890'
                          {...field}
                          className='pl-10'
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={signupForm.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Home className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                      <Input
                        placeholder='123 Main St, Apartment 4B'
                        {...field}
                        className='pl-10'
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )
      case 3:
        if (userType === 'admin') {
          return (
            <div className='space-y-4'>
              <FormField
                control={signupForm.control}
                name='secretCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Secret Code</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <KeyRound className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <Input
                          placeholder='Enter secret code (if you are the first admin)'
                          {...field}
                          className='pl-10'
                        />
                      </div>
                    </FormControl>
                    <p className='text-xs text-gray-500 mt-1'>
                      Only required for the first admin of a city. Subsequent admins will be approved.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name='termsAccepted'
                render={({ field }) => (
                  <FormItem className='flex items-start space-x-2 space-y-0 pt-2'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className='mt-1'
                      />
                    </FormControl>
                    <FormLabel className='text-sm font-normal cursor-pointer'>
                      I accept the{' '}
                      <a href='#' className='underline'>
                        Terms and Conditions
                      </a>
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )
        }
        return (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <FormField
                control={signupForm.control}
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <MapPin className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <Input
                          placeholder='City'
                          {...field}
                          className='pl-10'
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name='state'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <MapPin className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <Input
                          placeholder='State'
                          {...field}
                          className='pl-10'
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name='pincode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <MapPin className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <Input
                          placeholder='123456'
                          {...field}
                          className='pl-10'
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={signupForm.control}
              name='termsAccepted'
              render={({ field }) => (
                <FormItem className='flex items-start space-x-2 space-y-0 pt-2'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className='mt-1'
                    />
                  </FormControl>
                  <FormLabel className='text-sm font-normal cursor-pointer'>
                    I accept the{' '}
                    <a href='#' className='underline'>
                      Terms and Conditions
                    </a>
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='w-[90%] max-w-3xl rounded-xl p-0 overflow-hidden'>
        <div className='grid grid-cols-1 md:grid-cols-2'>
          {/* Left Column: Image */}
          <div className='hidden md:block relative bg-gray-100'>
            <img
              src={type === 'login' ? '/login.png' : '/signup.png'}
              alt={
                type === 'login'
                  ? 'Login illustration'
                  : 'Signup illustration'
              }
              className={cn(
                'absolute inset-0 w-full h-full',
                type === 'login'
                  ? 'object-contain py-8 px-2'
                  : 'object-cover px-4',
              )}
            />
          </div>

          {/* Right Column: Form */}
          <div className='p-6 md:p-8 flex flex-col justify-center m-1 rounded-lg'>
            <DialogHeader className='text-center mb-4'>
              <DialogTitle className='text-2xl font-bold'>
                <span className='text-primary'>Clean</span>
                <span className='text-secondary'>City</span>
              </DialogTitle>
              <DialogDescription>
                {type === 'login'
                  ? `Welcome back! Login as ${userType}`
                  : `Create your ${userType} account`}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert variant='destructive' className='mb-4'>
                <AlertTriangle className='h-4 w-4' />
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {type === 'login' ? (
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className='space-y-4'
                >
                  <FormField
                    control={loginForm.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                            <Input
                              type='email'
                              placeholder='your@email.com'
                              {...field}
                              className='pl-10'
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder='••••••••'
                              {...field}
                              className='pl-10 pr-10'
                            />
                            <button
                              type='button'
                              onClick={() => setShowPassword(!showPassword)}
                              className='absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer'
                              aria-label={
                                showPassword
                                  ? 'Hide password'
                                  : 'Show password'
                              }
                            >
                              {showPassword ? (
                                <EyeOff className='h-4 w-4 text-gray-400' />
                              ) : (
                                <Eye className='h-4 w-4 text-gray-400' />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className='flex items-center justify-between'>
                    <FormField
                      control={loginForm.control}
                      name='rememberMe'
                      render={({ field }) => (
                        <FormItem className='flex items-center space-x-2 space-y-0'>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className='cursor-pointer text-sm'>
                            Remember me
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <a
                      href='#'
                      className='text-sm text-primary hover:underline'
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Button
                    type='submit'
                    className='w-full gap-2'
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className='h-4 w-4 animate-spin' />}{' '}
                    Login
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...signupForm}>
                <form
                  onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                  className='space-y-4'
                >
                  <div className='flex items-center justify-between mb-1'>
                    <div className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                      {currentStepInfo.icon}
                      <span>{currentStepInfo.title}</span>
                    </div>
                    <div className='text-sm text-gray-500'>
                      Step {step} of {totalSteps}
                    </div>
                  </div>
                  <ProgressBar currentStep={step} totalSteps={totalSteps} />
                  <AnimatePresence mode='wait'>
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.3 }}
                      className='min-h-[240px]'
                    >
                      {renderSignupStepContent()}
                    </motion.div>
                  </AnimatePresence>
                  <div className='flex justify-between items-center pt-2'>
                    {step > 1 ? (
                      <Button
                        type='button'
                        variant='outline'
                        onClick={handleBack}
                        className='gap-2'
                      >
                        <ArrowLeft className='h-4 w-4' /> Back
                      </Button>
                    ) : (
                      <div />
                    )}
                    {step < totalSteps ? (
                      <Button
                        type='button'
                        onClick={handleNext}
                        className='gap-2'
                      >
                        Next <ArrowRight className='h-4 w-4' />
                      </Button>
                    ) : (
                      <Button type='submit' disabled={isLoading}>
                        {isLoading && (
                          <Loader2 className='h-4 w-4 animate-spin mr-2' />
                        )}
                        {userType === 'admin' ? 'Submit Request' : 'Create Account'}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            )}

            <div className='text-center text-sm text-gray-600 mt-4 pt-4 border-t'>
              {type === 'login'
                ? "Don't have an account? "
                : 'Already have an account? '}
              <button
                onClick={() =>
                  onSwitchType(
                    type === 'login' ? 'signup' : 'login',
                    userType,
                  )
                }
                className='text-primary font-medium hover:underline'
              >
                {type === 'login' ? 'Sign up' : 'Login'}
              </button>
              <span className='mx-2'>|</span>
              <button
                onClick={() =>
                  onSwitchType(type, userType === 'user' ? 'admin' : 'user')
                }
                className='text-secondary font-medium hover:underline'
              >
                {userType === 'user'
                  ? `${type === 'login' ? 'Admin Login' : 'Admin Signup'}`
                  : `${type === 'login' ? 'User Login' : 'User Signup'}`}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AuthModal