export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className='flex flex-col items-center justify-center py-20'>
      <div className='spinner'></div>
      <p className='mt-4 text-slate-500'>{message}</p>
    </div>
  );
}
