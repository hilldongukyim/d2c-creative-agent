import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory storage for cumulative stats (resets on function cold start)
// For persistent storage, you would use a database
let totalFeedback = 0;
let totalLikes = 0;
let totalDislikes = 0;

interface FeedbackRequest {
  feedbackType: 'like' | 'dislike';
  comment: string;
  mainProductUrl: string;
  secondProductUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedbackType, comment, mainProductUrl, secondProductUrl }: FeedbackRequest = await req.json();

    console.log('Received feedback:', { feedbackType, comment, mainProductUrl, secondProductUrl });

    // Update cumulative stats
    totalFeedback++;
    if (feedbackType === 'like') {
      totalLikes++;
    } else {
      totalDislikes++;
    }

    const likePercentage = totalFeedback > 0 ? Math.round((totalLikes / totalFeedback) * 100) : 0;
    const dislikePercentage = totalFeedback > 0 ? Math.round((totalDislikes / totalFeedback) * 100) : 0;

    // Format timestamp in Korean timezone
    const timestamp = new Date().toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const feedbackEmoji = feedbackType === 'like' ? '👍' : '👎';
    const feedbackLabel = feedbackType === 'like' ? '좋아요' : '아쉬워요';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .stats { background: white; padding: 15px; border-radius: 8px; margin-top: 15px; }
            .stat-item { display: inline-block; margin-right: 20px; }
            .label { font-size: 12px; color: #6b7280; }
            .value { font-size: 18px; font-weight: bold; }
            .like { color: #10b981; }
            .dislike { color: #ef4444; }
            .url-box { background: #e5e7eb; padding: 10px; border-radius: 5px; margin: 5px 0; word-break: break-all; font-size: 13px; }
            .comment-box { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 15px; }
            .footer { text-align: center; padding: 15px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">📊 Ben Feedback Report</h1>
              <p style="margin: 5px 0 0; opacity: 0.9;">PTO Gallery Image Generator</p>
            </div>
            
            <div class="content">
              <p><strong>⏰ 접수 시간:</strong> ${timestamp}</p>
              <p><strong>${feedbackEmoji} 피드백 유형:</strong> <span class="${feedbackType}">${feedbackLabel}</span></p>
              
              ${comment ? `
                <div class="comment-box">
                  <strong>💬 사용자 의견:</strong>
                  <p style="margin: 10px 0 0;">${comment}</p>
                </div>
              ` : ''}
              
              <h3 style="margin-top: 20px;">📝 사용한 제품 URL:</h3>
              <p><strong>Main Product:</strong></p>
              <div class="url-box">${mainProductUrl || 'N/A'}</div>
              <p><strong>Second Product:</strong></p>
              <div class="url-box">${secondProductUrl || 'N/A'}</div>
              
              <div class="stats">
                <h3 style="margin-top: 0;">📈 누적 통계 (현재 세션)</h3>
                <div class="stat-item">
                  <div class="label">총 피드백</div>
                  <div class="value">${totalFeedback}건</div>
                </div>
                <div class="stat-item">
                  <div class="label">좋아요</div>
                  <div class="value like">${totalLikes}건 (${likePercentage}%)</div>
                </div>
                <div class="stat-item">
                  <div class="label">아쉬워요</div>
                  <div class="value dislike">${totalDislikes}건 (${dislikePercentage}%)</div>
                </div>
              </div>
            </div>
            
            <div class="footer">
              <p>이 이메일은 LG AI Crew - Ben으로부터 자동 발송되었습니다.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "LG AI Crew <onboarding@resend.dev>",
      to: ["donguk.yim@lge.com"],
      subject: `[Ben Feedback] ${feedbackEmoji} ${feedbackLabel} - ${timestamp}`,
      html: emailHtml,
    });

    console.log("Feedback email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Feedback sent successfully",
        stats: {
          totalFeedback,
          totalLikes,
          totalDislikes,
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in ben-feedback-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
