import { Card } from "@/components/ui/card";

const Crawling = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            웹 크롤링
          </h1>
          <p className="text-muted-foreground text-lg">
            데이터 수집 및 분석을 위한 웹 크롤링 도구
          </p>
        </div>

        <Card className="p-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              크롤링 기능을 구현해주세요.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Crawling;