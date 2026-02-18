

export default function Home() {
  return (
    
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCF0]">
      <div className="w-full max-w-4xl p-8 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to NoteBook</h1>
          <p className="text-gray-500 mb-6">Your collaborative note-taking ecosystem for students and professionals.</p>
          <p>{process.env.DATABASE_URL}</p>
        </div>
        <div className="flex-1">
          
        </div>
      </div>
      </div>
  );
}
