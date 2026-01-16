import serverBusyIllustration from "@/assets/server-busy-illustration.png";

const ServerBusy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md text-center">
        {/* Illustration */}
        <div className="mb-8">
          <img 
            src={serverBusyIllustration} 
            alt="Twin Crew characters busy working" 
            className="w-full max-w-sm mx-auto"
          />
        </div>

        {/* Headline */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 font-['LGEIText']">
          Oops, it's Getting Crowded in Here!
        </h1>

        {/* Body */}
        <p className="text-base md:text-lg text-muted-foreground font-['LGEIText']">
          The interest in Twin Crew is huge! We are working on it. Please check back soon!
        </p>

        {/* Optional: Return Home Button */}
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-8 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold font-['LGEIText'] hover:opacity-90 transition-opacity"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};

export default ServerBusy;
