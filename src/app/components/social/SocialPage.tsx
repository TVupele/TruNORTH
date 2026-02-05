import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase, API_URL } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Image as ImageIcon, 
  Send, 
  Loader2, 
  X,
  TrendingUp,
  Hash,
  Trash2,
  User
} from 'lucide-react';

// --- Types ---
interface Post {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  user_id: string;
  author: { 
    name: string; 
    username?: string;
    avatar_url?: string;
  };
  likes_count: number; // Aggregate from DB
  comments_count: number; // Aggregate from DB
  user_has_liked: boolean; // Computed state
}

export function SocialPage() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get current user and fetch initial posts
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      fetchPosts(data.user?.id);
    });

    // --- Realtime Subscription ---
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, 
        (payload) => {
          // In a real app, you'd fetch the full relation for the new post
          // For now, we trigger a refresh or optimistically add if we have author data
          fetchPosts(user?.id); 
          toast.info("New post received!");
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchPosts = async (currentUserId?: string) => {
    try {
      setLoading(true);
      // Fetch posts with author details and localized likes
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(name, username, avatar_url),
          likes:post_likes(count),
          comments:post_comments(count),
          user_liked:post_likes!inner(user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match our UI shape
      const formattedPosts: Post[] = data.map((post: any) => ({
        ...post,
        likes_count: post.likes?.[0]?.count || 0,
        comments_count: post.comments?.[0]?.count || 0,
        // Check if the current user's ID exists in the filtered likes join
        user_has_liked: post.user_liked?.some((l: any) => l.user_id === currentUserId) || false
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Fallback to empty if table doesn't exist yet
      setPosts([]); 
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  const handleDeletePost = async (postId: string) => {
    if(!confirm("Are you sure you want to delete this post?")) return;
    
    // Optimistic Update
    setPosts(prev => prev.filter(p => p.id !== postId));

    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) {
      toast.error("Failed to delete post");
      fetchPosts(user?.id); // Revert
    } else {
      toast.success("Post deleted");
    }
  };

  const handleLikeToggle = async (postId: string, currentLikedState: boolean) => {
    if (!user) { toast.error("Please login to like posts"); return; }

    // 1. Optimistic UI Update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          user_has_liked: !p.user_has_liked,
          likes_count: p.user_has_liked ? p.likes_count - 1 : p.likes_count + 1
        };
      }
      return p;
    }));

    // 2. Database Update
    try {
      if (currentLikedState) {
        // Unlike
        await supabase.from('post_likes').delete().match({ post_id: postId, user_id: user.id });
      } else {
        // Like
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      }
    } catch (error) {
      console.error(error);
      fetchPosts(user?.id); // Revert on error
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      
      <div className="lg:col-span-2 space-y-6">
        <CreatePostWidget onPostCreated={handlePostCreated} user={user} />

        <div className="space-y-6">
          {loading ? (
            [1, 2].map(i => <PostSkeleton key={i} />)
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No posts yet. Be the first to share!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                currentUserId={user?.id}
                onLike={() => handleLikeToggle(post.id, post.user_has_liked)}
                onDelete={() => handleDeletePost(post.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">Trending</h3>
          </div>
          <div className="space-y-4">
            {['LagosTraffic', 'TechWeek', 'Afcon2024'].map((tag, i) => (
              <div key={i} className="group cursor-pointer">
                <p className="text-xs text-gray-500 font-medium">Trending</p>
                <p className="font-bold text-gray-800 group-hover:text-blue-600">#{tag}</p>
                <p className="text-xs text-gray-400">1{i}.5k Posts</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Create Post with Image Upload ---
function CreatePostWidget({ onPostCreated, user }: { onPostCreated: (p: Post) => void, user: any }) {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;
    if (!user) { toast.error("Please login to post"); return; }

    setIsUploading(true);
    let publicImageUrl = null;

    try {
      // 1. Upload Image (if exists)
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('post_images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post_images')
          .getPublicUrl(filePath);
          
        publicImageUrl = publicUrl;
      }

      // 2. Insert Post to DB
      const { data, error } = await supabase
        .from('posts')
        .insert({
          content,
          image_url: publicImageUrl,
          user_id: user.id
        })
        .select(`*, author:profiles(*)`)
        .single();

      if (error) throw error;

      // 3. Update UI
      const newPost: Post = {
        ...data,
        likes_count: 0,
        comments_count: 0,
        user_has_liked: false
      };

      onPostCreated(newPost);
      
      // Reset Form
      setContent('');
      setImageFile(null);
      setImagePreview(null);
      toast.success("Posted successfully!");

    } catch (error: any) {
      toast.error(error.message || "Failed to create post");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
          {user?.user_metadata?.name?.charAt(0) || <User className="w-5 h-5"/>}
        </div>
        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full bg-transparent border-none outline-none resize-none placeholder-gray-500 text-lg h-20"
          />
          
          {imagePreview && (
            <div className="relative mb-3 inline-block">
              <img src={imagePreview} alt="Preview" className="h-32 rounded-lg object-cover border border-gray-200" />
              <button 
                type="button" 
                onClick={() => { setImagePreview(null); setImageFile(null); }}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <div className="flex gap-2 text-blue-500">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-blue-50 rounded-full transition-colors"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
            </div>
            
            <button 
              type="submit" 
              disabled={isUploading || (!content && !imageFile)}
              className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Post Card with Interactive Buttons ---
function PostCard({ post, currentUserId, onLike, onDelete }: { post: Post, currentUserId?: string, onLike: () => void, onDelete: () => void }) {
  const isAuthor = currentUserId === post.user_id;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {post.author?.name?.charAt(0) || '?'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900 text-sm">{post.author?.name || 'Unknown'}</p>
                <span className="text-gray-400 text-xs">· {new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-gray-500">{post.author?.username || '@user'}</p>
            </div>
          </div>
          {isAuthor && (
            <button onClick={onDelete} className="text-gray-400 hover:text-red-600 p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-gray-800 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
        
        {post.image_url && (
          <div className="mb-3 rounded-xl overflow-hidden bg-gray-50">
            <img src={post.image_url} alt="Post content" className="w-full h-auto max-h-96 object-cover" />
          </div>
        )}

        <div className="flex items-center gap-6 text-gray-500 pt-2 border-t border-gray-50">
          <button 
            onClick={onLike}
            className={`flex items-center gap-2 text-sm group transition-colors ${post.user_has_liked ? 'text-pink-600' : 'hover:text-pink-600'}`}
          >
            <Heart className={`w-5 h-5 ${post.user_has_liked ? 'fill-current' : ''}`} />
            <span>{post.likes_count}</span>
          </button>
          <button className="flex items-center gap-2 text-sm hover:text-blue-600 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments_count}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="w-1/3 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-1/4 h-3 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="w-full h-24 bg-gray-100 rounded-lg animate-pulse" />
    </div>
  );
}