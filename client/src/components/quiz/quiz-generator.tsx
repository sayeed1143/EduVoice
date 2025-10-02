import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  FileText, 
  Download, 
  Play, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Award,
  Target,
  BookOpen,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  materialIds: string[];
  createdAt: string;
}

interface QuizAttempt {
  id: string;
  quizId: string;
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

interface QuizGeneratorProps {
  selectedMaterialIds: string[];
  onQuizGenerated?: (quiz: Quiz) => void;
  className?: string;
}

export function QuizGenerator({ selectedMaterialIds, onQuizGenerated, className }: QuizGeneratorProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [numQuestions, setNumQuestions] = useState(10);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [attemptResults, setAttemptResults] = useState<any>(null);

  // Generate quiz mutation
  const generateQuizMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/quizzes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'demo-user'
        },
        body: JSON.stringify({
          materialIds: selectedMaterialIds,
          topic,
          difficulty,
          numQuestions
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate quiz');
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentQuiz(data.quiz);
      setCurrentAttempt({});
      setShowResults(false);
      onQuizGenerated?.(data.quiz);
      toast({
        title: "Quiz generated successfully",
        description: `Created ${data.quiz.questions.length} questions about ${topic}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Quiz generation failed",
        description: error instanceof Error ? error.message : "Failed to generate quiz",
        variant: "destructive",
      });
    }
  });

  // Submit quiz attempt mutation
  const submitQuizMutation = useMutation({
    mutationFn: async () => {
      if (!currentQuiz) throw new Error('No quiz to submit');
      
      const response = await fetch(`/api/quizzes/${currentQuiz.id}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'demo-user'
        },
        body: JSON.stringify({
          answers: currentAttempt
        })
      });
      
      if (!response.ok) throw new Error('Failed to submit quiz');
      return response.json();
    },
    onSuccess: (data) => {
      setAttemptResults(data);
      setShowResults(true);
      toast({
        title: "Quiz completed!",
        description: `You scored ${data.attempt.score}/${data.attempt.totalQuestions}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Failed to submit quiz",
        variant: "destructive",
      });
    }
  });

  // Fetch user's quizzes
  const { data: quizzesData } = useQuery({
    queryKey: ['/api/quizzes'],
    queryFn: async () => {
      const response = await fetch('/api/quizzes', {
        headers: { 'X-User-Id': 'demo-user' }
      });
      if (!response.ok) throw new Error('Failed to fetch quizzes');
      return response.json();
    }
  });

  const handleGenerateQuiz = () => {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for the quiz",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedMaterialIds.length === 0) {
      toast({
        title: "Materials required",
        description: "Please select at least one material to generate quiz from",
        variant: "destructive",
      });
      return;
    }
    
    generateQuizMutation.mutate();
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setCurrentAttempt(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitQuiz = () => {
    if (!currentQuiz) return;
    
    const unansweredQuestions = currentQuiz.questions.filter(q => !currentAttempt[q.id]);
    if (unansweredQuestions.length > 0) {
      toast({
        title: "Incomplete quiz",
        description: `Please answer all questions. ${unansweredQuestions.length} questions remaining.`,
        variant: "destructive",
      });
      return;
    }
    
    submitQuizMutation.mutate();
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const exportQuizAsPDF = async () => {
    if (!currentQuiz) return;
    
    // TODO: Implement PDF export functionality
    toast({
      title: "Export feature",
      description: "PDF export functionality would be implemented here",
    });
  };

  if (showResults && attemptResults) {
    const percentage = Math.round((attemptResults.attempt.score / attemptResults.attempt.totalQuestions) * 100);
    
    return (
      <Card className={cn("w-full", className)} data-testid="quiz-results">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          <div className={cn("text-4xl font-bold", getScoreColor(percentage))}>
            {attemptResults.attempt.score}/{attemptResults.attempt.totalQuestions}
          </div>
          <p className="text-muted-foreground">
            You scored {percentage}% on "{currentQuiz?.title}"
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Score Breakdown */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {attemptResults.attempt.score}
              </div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {attemptResults.attempt.totalQuestions - attemptResults.attempt.score}
              </div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {percentage}%
              </div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
          </div>

          <Separator />

          {/* Detailed Results */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-primary" />
              Review Your Answers
            </h4>
            
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {attemptResults.results.map((result: any, index: number) => {
                  const question = currentQuiz?.questions.find(q => q.id === result.questionId);
                  if (!question) return null;
                  
                  return (
                    <Card key={result.questionId} className={cn(
                      "p-4 border-l-4",
                      result.isCorrect ? "border-l-green-500 bg-green-50 dark:bg-green-950/20" : "border-l-red-500 bg-red-50 dark:bg-red-950/20"
                    )}>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          {result.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">Question {index + 1}</p>
                            <p className="text-sm">{question.question}</p>
                          </div>
                        </div>
                        
                        <div className="ml-8 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant={result.isCorrect ? "default" : "destructive"}>
                              Your Answer: {result.userAnswer}
                            </Badge>
                            {!result.isCorrect && (
                              <Badge variant="outline" className="border-green-500 text-green-600">
                                Correct: {result.correctAnswer}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-muted-foreground bg-background/50 p-3 rounded-lg">
                            <strong>Explanation:</strong> {result.explanation}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowResults(false);
                setCurrentQuiz(null);
                setCurrentAttempt({});
                setAttemptResults(null);
              }}
              data-testid="button-new-quiz"
            >
              Generate New Quiz
            </Button>
            <Button
              onClick={exportQuizAsPDF}
              data-testid="button-export-results"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentQuiz) {
    const progress = (Object.keys(currentAttempt).length / currentQuiz.questions.length) * 100;
    
    return (
      <Card className={cn("w-full", className)} data-testid="quiz-taking">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Target className="w-6 h-6 mr-2 text-primary" />
                {currentQuiz.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {currentQuiz.questions.length} questions • {currentQuiz.difficulty} difficulty
              </p>
            </div>
            <Badge variant="outline" className="capitalize">
              {currentQuiz.difficulty}
            </Badge>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Object.keys(currentAttempt).length}/{currentQuiz.questions.length}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-6">
              {currentQuiz.questions.map((question, index) => (
                <Card key={question.id} className="p-4 border-l-4 border-l-primary">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Badge variant="outline" className="mt-1">
                        Q{index + 1}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium">{question.question}</p>
                        {question.type === 'multiple_choice' && question.options && (
                          <RadioGroup
                            value={currentAttempt[question.id] || ''}
                            onValueChange={(value) => handleAnswerChange(question.id, value)}
                            className="mt-4"
                          >
                            {question.options.map((option) => (
                              <div key={option} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                                <Label 
                                  htmlFor={`${question.id}-${option}`}
                                  className="text-sm cursor-pointer flex-1"
                                >
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                        
                        {question.type === 'true_false' && (
                          <RadioGroup
                            value={currentAttempt[question.id] || ''}
                            onValueChange={(value) => handleAnswerChange(question.id, value)}
                            className="mt-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="True" id={`${question.id}-true`} />
                              <Label htmlFor={`${question.id}-true`} className="cursor-pointer">
                                True
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="False" id={`${question.id}-false`} />
                              <Label htmlFor={`${question.id}-false`} className="cursor-pointer">
                                False
                              </Label>
                            </div>
                          </RadioGroup>
                        )}
                        
                        {question.type === 'short_answer' && (
                          <Textarea
                            placeholder="Type your answer here..."
                            value={currentAttempt[question.id] || ''}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className="mt-4"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
          
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentQuiz(null)}
              data-testid="button-cancel-quiz"
            >
              Cancel Quiz
            </Button>
            <Button
              onClick={handleSubmitQuiz}
              disabled={submitQuizMutation.isPending || Object.keys(currentAttempt).length < currentQuiz.questions.length}
              className="bg-gradient-to-r from-primary to-accent"
              data-testid="button-submit-quiz"
            >
              {submitQuizMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Submit Quiz
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)} data-testid="quiz-generator">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="w-6 h-6 mr-2 text-primary" />
          Smart Quiz Generator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate personalized quizzes from your study materials using AI
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Quiz Configuration */}
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="quiz-topic">Quiz Topic</Label>
            <Input
              id="quiz-topic"
              placeholder="e.g., Photosynthesis, Newton's Laws, Machine Learning..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              data-testid="input-quiz-topic"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quiz-difficulty">Difficulty Level</Label>
              <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
                <SelectTrigger data-testid="select-quiz-difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="num-questions">Number of Questions</Label>
              <Select value={numQuestions.toString()} onValueChange={(value) => setNumQuestions(parseInt(value))}>
                <SelectTrigger data-testid="select-num-questions">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 questions</SelectItem>
                  <SelectItem value="10">10 questions</SelectItem>
                  <SelectItem value="15">15 questions</SelectItem>
                  <SelectItem value="20">20 questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Material Selection Info */}
        {selectedMaterialIds.length > 0 ? (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="font-medium text-primary">Materials Selected</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedMaterialIds.length} material{selectedMaterialIds.length !== 1 ? 's' : ''} selected for quiz generation
            </p>
          </div>
        ) : (
          <div className="bg-muted border border-border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">No Materials Selected</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Please select materials from the sidebar to generate quiz questions
            </p>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerateQuiz}
          disabled={generateQuizMutation.isPending || !topic.trim() || selectedMaterialIds.length === 0}
          className="w-full bg-gradient-to-r from-primary to-accent text-white"
          data-testid="button-generate-quiz"
        >
          {generateQuizMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Quiz...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Generate Quiz
            </>
          )}
        </Button>

        {/* Recent Quizzes */}
        {quizzesData?.quizzes && quizzesData.quizzes.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <h4 className="font-medium">Recent Quizzes</h4>
            <div className="space-y-2">
              {quizzesData.quizzes.slice(0, 3).map((quiz: Quiz) => (
                <Card key={quiz.id} className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{quiz.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {quiz.questions.length} questions • {quiz.difficulty}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
