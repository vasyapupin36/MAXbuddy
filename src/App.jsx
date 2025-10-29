import { useState, useEffect } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { motion } from "framer-motion";

export default function App() {
  const [userLink, setUserLink] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [requests, setRequests] = useState([]);
  const [text, setText] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showNewRequest, setShowNewRequest] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("max_requests");
    if (saved) setRequests(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("max_requests", JSON.stringify(requests));
  }, [requests]);

  const handleLogin = () => {
    if (userLink.trim().startsWith("https://max.ru/u/")) {
      setLoggedIn(true);
      setShowLogin(false);
    } else alert("Введите корректную ссылку на профиль MAX!");
  };

  const handleAddRequest = () => {
    if (!text.trim() || !loggedIn) return;
    const newRequests = [...requests, { text, link: userLink, id: Date.now() }];
    setRequests(newRequests);
    setText("");
    setShowNewRequest(false);
  };

  const handleDelete = (id) => {
    const filtered = requests.filter((req) => req.id !== id);
    setRequests(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white flex flex-col items-center p-6 relative">
      {/* Верхняя панель */}
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">MAXBuddy 💬</h1>
        <div className="flex gap-3">
          {loggedIn && (
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setShowNewRequest(true)}
            >
              Оставить заявку
            </Button>
          )}
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowLogin(true)}
          >
            {loggedIn ? "Профиль" : "Войти"}
          </Button>
        </div>
      </div>

      {/* Секция заявок */}
      <div className="w-full max-w-2xl">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 mb-8">
          <CardContent>
            <p className="text-lg mb-4">Активные заявки:</p>
            {requests.length === 0 ? (
              <p className="text-white/70 text-center">Пока нет заявок 🙌</p>
            ) : (
              <>
                {requests
                  .slice(-3)
                  .reverse()
                  .map((req) => (
                    <Card
                      key={req.id}
                      className="bg-white/10 border-white/20 backdrop-blur-md p-4 mb-3"
                    >
                      <CardContent>
                        <p className="text-white mb-3">{req.text}</p>
                        <div className="flex gap-2">
                          <Button
                            asChild
                            className={`${
                              loggedIn
                                ? "bg-indigo-600 hover:bg-indigo-700"
                                : "bg-gray-500 cursor-not-allowed"
                            } text-white`}
                            disabled={!loggedIn}
                          >
                            <a
                              href={loggedIn ? req.link : "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Перейти в личные сообщения
                            </a>
                          </Button>
                          {loggedIn && req.link === userLink && (
                            <Button
                              onClick={() => handleDelete(req.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Удалить
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {requests.length > 3 && (
                  <div className="text-center mt-3">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => setShowAll(true)}
                    >
                      Показать все заявки
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Модальное окно входа */}
      {showLogin && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 w-full max-w-md p-6">
            <CardContent className="flex flex-col gap-4">
              <p className="text-center text-lg">Вход по ссылке на профиль MAX</p>
              <Input
                placeholder="https://max.ru/u/..."
                value={userLink}
                onChange={(e) => setUserLink(e.target.value)}
                className="bg-white/20 border-none text-white placeholder:text-white/50"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                  onClick={() => setShowLogin(false)}
                >
                  Отмена
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleLogin}
                >
                  Войти
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Модальное окно новой заявки */}
      {showNewRequest && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 w-full max-w-md p-6">
            <CardContent className="flex flex-col gap-4">
              <p className="text-lg">Разместить заявку:</p>
              <Textarea
                placeholder="Введите текст вашей заявки..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="bg-white/20 border-none text-white placeholder:text-white/50"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                  onClick={() => setShowNewRequest(false)}
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleAddRequest}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Опубликовать
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Модальное окно всех заявок */}
      {showAll && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 overflow-auto">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 w-full max-w-2xl p-6">
            <CardContent className="flex flex-col gap-4">
              <p className="text-xl text-center mb-2">Все заявки</p>
              {requests
                .slice()
                .reverse()
                .map((req) => (
                  <Card
                    key={req.id}
                    className="bg-white/10 border-white/20 backdrop-blur-md p-4"
                  >
                    <CardContent>
                      <p className="text-white mb-3">{req.text}</p>
                      <div className="flex gap-2">
                        <Button
                          asChild
                          className={`${
                            loggedIn
                              ? "bg-indigo-600 hover:bg-indigo-700"
                              : "bg-gray-500 cursor-not-allowed"
                          } text-white`}
                          disabled={!loggedIn}
                        >
                          <a
                            href={loggedIn ? req.link : "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Перейти в личные сообщения
                          </a>
                        </Button>
                        {loggedIn && req.link === userLink && (
                          <Button
                            onClick={() => handleDelete(req.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Удалить
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              <div className="text-center mt-4">
                <Button
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                  onClick={() => setShowAll(false)}
                >
                  Закрыть
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
