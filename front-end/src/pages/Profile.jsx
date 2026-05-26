import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import PostCard from '../components/PostCard';

export default function Profile() {
  const { id } = useParams();
  const { user, dispatch } = useAuth();
  const navigate = useNavigate();
  const isOwn = user?.id === id || user?._id === id;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const avatarRef = useRef();
  const coverRef = useRef();

  document.title = 'Profile | AntiSocial';

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await API.get(`/users/${id}`);
      setProfile(res.data);
      setBio(res.data.bio || '');
      setWebsite(res.data.website || '');
      const followerId = user?.id || user?._id;
      setIsFollowing(
        res.data.followers?.some(
          f => (f.id || f._id || f) === followerId
        )
      );
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await API.get(`/posts/user/${id}`);
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    
    setUploadingAvatar(true);
    const toastId = toast.loading('Uploading photo...');
    
    try {
      const form = new FormData();
      form.append('profilePicture', file);
      
      const userId = user?.id || user?._id;
      const res = await API.put(
        `/users/${userId}`,
        form,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data' 
          } 
        }
      );
      
      setProfile(res.data);
      dispatch({ 
        type: 'UPDATE_USER', 
        payload: { 
          profilePicture: res.data.profilePicture 
        } 
      });
      toast.success('Profile picture updated! 📸', 
        { id: toastId });
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error(
        err.response?.data?.message || 
        'Upload failed. Try again.',
        { id: toastId }
      );
    } finally {
      setUploadingAvatar(false);
      // Reset file input so same file can be 
      // selected again
      if (avatarRef.current) {
        avatarRef.current.value = '';
      }
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }
    
    setUploadingCover(true);
    const toastId = toast.loading('Uploading cover...');
    
    try {
      const form = new FormData();
      form.append('coverPhoto', file);
      
      const userId = user?.id || user?._id;
      const res = await API.put(
        `/users/${userId}`,
        form,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data' 
          } 
        }
      );
      
      setProfile(res.data);
      dispatch({ 
        type: 'UPDATE_USER', 
        payload: { 
          coverPhoto: res.data.coverPhoto 
        } 
      });
      toast.success('Cover photo updated! 🖼️', 
        { id: toastId });
    } catch (err) {
      console.error('Cover upload error:', err);
      toast.error(
        err.response?.data?.message || 
        'Upload failed. Try again.',
        { id: toastId }
      );
    } finally {
      setUploadingCover(false);
      if (coverRef.current) {
        coverRef.current.value = '';
      }
    }
  };

  const handleFollow = async () => {
    try {
      const res = await API.put(
        `/users/${id}/follow`
      );
      setIsFollowing(res.data.following);
      fetchProfile();
      toast.success(
        res.data.following ? 'Following! 👋' : 'Unfollowed'
      );
    } catch (err) {
      toast.error('Failed');
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await API.put(
        `/users/${user?.id || user?._id}`,
        { bio, website }
      );
      setProfile(res.data);
      dispatch({ 
        type: 'UPDATE_USER', 
        payload: { bio, website } 
      });
      setEditing(false);
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleAIBio = async () => {
    setAiLoading(true);
    try {
      const res = await API.post('/ai/bio');
      if (res.data.disabled) {
        toast('✨ AI features coming soon!');
        return;
      }
      setBio(res.data.bio);
      toast.success('AI bio generated! ✨');
    } catch (err) {
      toast.error('AI not available yet');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center 
                    min-h-screen">
      <div className="w-8 h-8 border-2 border-brand-500 
                      border-t-transparent rounded-full 
                      animate-spin"/>
    </div>
  );

  if (!profile) return (
    <div className="text-center py-20 text-[#71717a]">
      User not found
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 
                    animate-fade-in">
      {/* Cover Photo */}
      <div className="relative h-52 rounded-2xl 
                      overflow-hidden mb-16 group">
        {profile.coverPhoto ? (
          <img 
            src={profile.coverPhoto} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full 
                          bg-gradient-to-br 
                          from-brand-600 to-purple-600"/>
        )}
        
        {/* Cover upload overlay - only own profile */}
        {isOwn && (
          <>
            <div 
              onClick={() => coverRef.current?.click()}
              className="absolute inset-0 bg-black/40 
                         opacity-0 group-hover:opacity-100
                         transition-all duration-200 
                         flex items-center justify-center 
                         cursor-pointer">
              {uploadingCover ? (
                <div className="w-8 h-8 border-2 
                                border-white 
                                border-t-transparent 
                                rounded-full animate-spin"/>
              ) : (
                <div className="text-white text-center">
                  <div className="text-3xl mb-1">📷</div>
                  <p className="text-sm font-medium">
                    Change cover photo
                  </p>
                </div>
              )}
            </div>
            <input 
              ref={coverRef}
              type="file" 
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
          </>
        )}
      </div>

      {/* Avatar + Info Row */}
      <div className="flex items-end justify-between 
                      -mt-24 px-4 mb-6">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-full 
                          border-4 border-[#050508] 
                          overflow-hidden relative bg-[#050508]">
            <img
              src={profile.profilePicture || 
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
              className="w-full h-full object-cover"
            />
            {uploadingAvatar && (
              <div className="absolute inset-0 
                              bg-black/60 flex 
                              items-center justify-center">
                <div className="w-6 h-6 border-2 
                                border-white 
                                border-t-transparent 
                                rounded-full animate-spin"/>
              </div>
            )}
          </div>

          {/* Avatar upload button - only own profile */}
          {isOwn && (
            <>
              <button
                onClick={() => avatarRef.current?.click()}
                className="absolute bottom-0 right-0 
                           w-8 h-8 bg-brand-500 
                           hover:bg-brand-600
                           rounded-full flex items-center 
                           justify-center text-white 
                           text-sm transition-all
                           border-2 border-[#050508]">
                📷
              </button>
              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-2">
          {isOwn ? (
            <button
              onClick={() => setEditing(!editing)}
              className="btn-outline text-sm">
              {editing ? 'Cancel' : 'Edit profile'}
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate(`/messages/${id}`)}
                className="btn-outline text-sm">
                💬 Message
              </button>
              <button
                onClick={handleFollow}
                className={isFollowing 
                  ? 'btn-outline text-sm' 
                  : 'btn-primary text-sm'}>
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-white">
            {profile.username}
          </h2>
          {profile.isVerified && (
            <span className="text-brand-400 text-lg">✓</span>
          )}
        </div>
        <p className="text-[#71717a] text-sm mb-3">
          @{profile.username}
        </p>

        {/* Stats */}
        <div className="flex gap-6 mb-4">
          {[
            { label: 'Posts', value: posts.length },
            { label: 'Followers', 
              value: profile.followers?.length || 0 },
            { label: 'Following', 
              value: profile.following?.length || 0 }
          ].map(stat => (
            <div key={stat.label}>
              <span className="font-bold text-white">
                {stat.value}
              </span>{' '}
              <span className="text-[#71717a] text-sm">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Bio & Website */}
        {editing ? (
          <div className="space-y-3 mt-4">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a bio..."
              className="w-full bg-dark-700 border border-dark-600 
                         rounded-xl p-3 text-white 
                         focus:border-brand-500 outline-none
                         resize-none h-24"
            />
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Website URL"
              className="w-full bg-dark-700 border border-dark-600 
                         rounded-xl p-3 text-white 
                         focus:border-brand-500 outline-none"
            />
            <div className="flex gap-2">
              <button 
                onClick={handleSaveProfile}
                className="btn-primary flex-1">
                Save Changes
              </button>
              <button 
                onClick={handleAIBio}
                disabled={aiLoading}
                className="btn-outline flex-1">
                {aiLoading ? 'Generating...' : '✨ Magic Bio'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {profile.bio && (
              <p className="text-zinc-200 text-sm whitespace-pre-wrap">
                {profile.bio}
              </p>
            )}
            {profile.website && (
              <a 
                href={profile.website} 
                target="_blank" 
                rel="noreferrer"
                className="text-brand-400 text-sm hover:underline flex items-center gap-1">
                🔗 {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-700 mb-6">
        {['posts', 'media', 'likes'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition-all
              ${activeTab === t 
                ? 'text-brand-400 border-b-2 border-brand-400' 
                : 'text-[#71717a] hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Posts Grid/List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-10 text-[#71717a]">
            No posts yet
          </div>
        ) : (
          activeTab === 'posts' ? (
            posts.map(post => (
              <PostCard 
                key={post.id || post._id} 
                post={post} 
                onUpdate={fetchPosts} 
              />
            ))
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {posts
                .filter(p => activeTab === 'likes' ? (p.likes || []).includes(user?.id || user?._id) : (p.image || p.video))
                .map(post => (
                <div key={post.id || post._id} className="aspect-square bg-dark-800">
                  {post.mediaType === 'video' ? (
                    <video src={post.video} className="w-full h-full object-cover" />
                  ) : (
                    post.image && <img src={post.image} className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
