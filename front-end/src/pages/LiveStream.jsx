export default function LiveStream() {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-white">Live studio</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#a1a1aa]">
          Go live to your audience. This surface is ready for WebRTC or RTMP integration.
        </p>
        <div className="mt-6 rounded-3xl border border-dashed border-dark-500 bg-dark-950 p-6">
          <div className="aspect-video w-full rounded-2xl bg-gradient-card shadow-card" />
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="btn-primary">
              Start stream
            </button>
            <button type="button" className="btn-outline">
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
