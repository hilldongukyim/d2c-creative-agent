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
          Oops, It's Getting Crowded in Here
        </h1>

        {/* Body */}
        <p className="text-base md:text-lg text-muted-foreground font-['LGEIText']">
          Twin Crew is experiencing high demand right now. We're on it—please check back soon.
        </p>
      </div>
    </div>
  );
};

export default ServerBusy;
