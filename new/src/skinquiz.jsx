import { useState } from "react";

const styles = `
.skinQuizSection {
  padding: 64px 0;
}
.skinQuizCard {
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  position: relative;
  box-shadow: 0 20px 40px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.04);
}
.skinQuizContent {
  flex: 1;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 2;
}
.skinQuizTitle {
  font-size: 32px;
  font-weight: 900;
  margin-bottom: 12px;
  color: #1b1b1b;
  letter-spacing: -0.5px;
}
.skinQuizDesc {
  font-size: 16px;
  line-height: 1.6;
  color: #6f6f6f;
  margin-bottom: 32px;
  max-width: 440px;
}
.skinQuizActions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.btnQuizPrimary {
  background: #1b1b1b;
  color: #fff;
  padding: 14px 28px;
  border-radius: 99px;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}
.btnQuizPrimary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
  background: #000;
}
.btnQuizSecondary {
  background: transparent;
  color: #1b1b1b;
  padding: 14px 28px;
  border-radius: 99px;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
}
.btnQuizSecondary:hover {
  background: #fff;
  border-color: #1b1b1b;
}

.skinQuizVisual {
  flex: 1;
  background: #fff;
  position: relative;
  display: grid;
  place-items: center;
  min-height: 300px;
  overflow: hidden;
}
.skinQuizMesh {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 80% 20%, #e0c3fc 0%, transparent 40%),
    radial-gradient(circle at 20% 80%, #a8edea 0%, transparent 40%);
  opacity: 0.6;
}
.routinePreview {
  position: relative;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(12px);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.6);
  box-shadow: 0 12px 32px rgba(0,0,0,0.08);
  width: 280px;
  transform: rotate(-2deg);
}
.routineItem {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.routineItem:last-child {
  margin-bottom: 0;
}
.routineIcon {
  width: 32px;
  height: 32px;
  background: #f1f5f9;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 12px;
}
.routineText {
  display: flex;
  flex-direction: column;
}
.routineLabel {
  font-size: 12px;
  font-weight: 700;
  color: #1b1b1b;
}
.routineSub {
  font-size: 10px;
  color: #888;
}

@media (max-width: 980px) {
  .skinQuizCard {
    flex-direction: column-reverse;
  }
  .skinQuizContent {
    padding: 32px 24px;
    text-align: center;
    align-items: center;
  }
  .skinQuizVisual {
    min-height: 200px;
  }
  .routinePreview {
    transform: rotate(0);
    scale: 0.9;
  }
}
`;

export default function SkinQuiz() {
    const supportPhone = "+91 90000 00000";

    return (
        <section className="skinQuizSection" aria-labelledby="quiz-heading">
            <style>{styles}</style>
            <div className="container">
                <div className="skinQuizCard">
                    <div className="skinQuizContent">
                        <h2 id="quiz-heading" className="skinQuizTitle">Unlock Your Best Skin</h2>
                        <p className="skinQuizDesc">
                            Not sure where to start? Take our 2-minute quiz to build a personalized routine targeted to your concerns.
                        </p>
                        <div className="skinQuizActions">
                            <button
                                className="btnQuizPrimary"
                                onClick={() => alert("Skin quiz functionality would open here")}
                            >
                                Start Skin Quiz
                            </button>
                            <a href={`tel:${supportPhone}`} className="btnQuizSecondary">
                                Talk to an Expert
                            </a>
                        </div>
                    </div>

                    <div className="skinQuizVisual" aria-hidden="true">
                        <div className="skinQuizMesh" />
                        <div className="routinePreview">
                            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', color: '#999', fontWeight: '700' }}>Your Personal Routine</div>
                            <div className="routineItem">
                                <div className="routineIcon">☀️</div>
                                <div className="routineText">
                                    <span className="routineLabel">Morning Cleanse</span>
                                    <span className="routineSub">Hydrating Foam</span>
                                </div>
                            </div>
                            <div className="routineItem">
                                <div className="routineIcon">💧</div>
                                <div className="routineText">
                                    <span className="routineLabel">Treat</span>
                                    <span className="routineSub">Vitamin C Serum</span>
                                </div>
                            </div>
                            <div className="routineItem">
                                <div className="routineIcon">🛡️</div>
                                <div className="routineText">
                                    <span className="routineLabel">Protect</span>
                                    <span className="routineSub">Invisible SPF 50</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
