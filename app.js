const state = {
  game: "cs2",
  view: "dashboard",
  selectedPlayerId: 1,
  registeredTournamentId: null,
  playerSearch: "",
  user: null,
  tournaments: [],
  players: [],
  matches: [],
  bracket: [],
};

const selectors = {
  shell: document.querySelector(".app-shell"),
  views: document.querySelectorAll(".view"),
  navButtons: document.querySelectorAll("[data-view]"),
  gameButtons: document.querySelectorAll("[data-game-switch]"),
  heroGame: document.querySelector("#heroGame"),
  heroTitle: document.querySelector("#heroTitle"),
  heroText: document.querySelector("#heroText"),
  brandLogo: document.querySelector("#brandLogo"),
  statStrip: document.querySelector("#statStrip"),
  myStats: document.querySelector("#myStats"),
  leaderList: document.querySelector("#leaderList"),
  leaderboardTitle: document.querySelector("#leaderboardTitle"),
  featuredTournament: document.querySelector("#featuredTournament"),
  recentMatches: document.querySelector("#recentMatches"),
  upcomingList: document.querySelector("#upcomingList"),
  codePanel: document.querySelector("#codePanel"),
  codePanelTitle: document.querySelector("#codePanelTitle"),
  tournamentGrid: document.querySelector("#tournamentGrid"),
  playerSearch: document.querySelector("#playerSearch"),
  playerResults: document.querySelector("#playerResults"),
  playerDetails: document.querySelector("#playerDetails"),
  leaderboardTable: document.querySelector("#leaderboardTable"),
  bracketBoard: document.querySelector("#bracketBoard"),
  adminForm: document.querySelector("#adminForm"),
  codeForm: document.querySelector("#codeForm"),
  bracketForm: document.querySelector("#bracketForm"),
  codeTournamentSelect: document.querySelector("#codeTournamentSelect"),
  matchSelect: document.querySelector("#matchSelect"),
  toast: document.querySelector("#toast"),
};

function activeGameName() {
  return state.game === "cs2" ? "CS2" : "Fortnite";
}

function setView(view) {
  state.view = view;
  selectors.views.forEach((node) => node.classList.toggle("active", node.id === view));
  selectors.navButtons.forEach((node) => node.classList.toggle("active", node.dataset.view === view));
}

function setGame(game) {
  state.game = game;
  selectors.shell.dataset.game = game;
  selectors.brandLogo.src = game === "cs2" ? "assets/logo-gold.png" : "assets/logo-purple.png";
  selectors.gameButtons.forEach((node) => {
    node.classList.toggle("current-game", node.dataset.gameSwitch === game);
  });
  renderAll();
}

function toast(message) {
  selectors.toast.textContent = message;
  selectors.toast.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => selectors.toast.classList.remove("show"), 2400);
}

function currentPlayer() {
  return state.players.find((player) => player.id === state.selectedPlayerId) || state.players[0];
}

function gameTournaments() {
  return state.tournaments.filter((tournament) => tournament.game === activeGameName());
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value).replaceAll(",", " ");
}

function renderHero() {
  const isCs2 = state.game === "cs2";
  selectors.heroGame.textContent = isCs2 ? "CS2" : "FORTNITE";
  selectors.heroTitle.textContent = isCs2
    ? "Сражайся в 2v2 турнирах ECS"
    : "Участвуй в кастомках и набирай ECS points";
  selectors.heroText.textContent = isCs2
    ? "Побеждай дуэли, проходи сетку и становись лучшим составом Elite Cyber Squad."
    : "Выполняй условия, получай код острова, играй weekly cups и поднимайся в рейтинге.";
}

function renderStatStrip() {
  const player = currentPlayer();
  const stats =
    state.game === "cs2"
      ? [
          ["ECS Rating", player.cs2Rating],
          ["Победы", player.wins],
          ["Матчи", player.matches],
          ["K/D", player.kd],
          ["Win Rate", player.winRate],
          ["MVP", player.mvp],
        ]
      : [
          ["ECS Points", player.fortnitePoints],
          ["Победы", 12],
          ["Матчи", 48],
          ["Убийства", player.kills],
          ["Top-10", player.top10],
          ["K/D", "3.25"],
        ];

  selectors.statStrip.innerHTML = stats
    .map(
      ([label, value]) => `
        <article class="stat-card">
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `,
    )
    .join("");
}

function renderMyStats() {
  const player = currentPlayer();
  selectors.myStats.innerHTML = `
    <div class="rank-block">
      <div class="rank-badge">ECS</div>
      <div>
        <span class="muted">RANK</span>
        <strong>${player.rank}</strong>
      </div>
      <div>
        <span class="muted">${state.game === "cs2" ? "ECS RATING" : "ECS POINTS"}</span>
        <strong>${formatNumber(state.game === "cs2" ? player.cs2Rating : player.fortnitePoints)}</strong>
      </div>
    </div>
    <div class="mini-stats">
      <div><span>Матчи</span><strong>${player.matches}</strong></div>
      <div><span>Победы</span><strong>${player.wins}</strong></div>
      <div><span>K/D</span><strong>${player.kd}</strong></div>
      <div><span>Win Rate</span><strong>${player.winRate}</strong></div>
      <div><span>MVP</span><strong>${player.mvp}</strong></div>
    </div>
    <div class="chart-line" aria-hidden="true"></div>
  `;
}

function leaderboardPlayers() {
  return [...state.players].sort((a, b) => {
    const key = state.game === "cs2" ? "cs2Rating" : "fortnitePoints";
    return b[key] - a[key];
  });
}

function renderLeaders() {
  selectors.leaderboardTitle.textContent = state.game === "cs2" ? "(CS2 2V2)" : "(FORTNITE)";
  const key = state.game === "cs2" ? "cs2Rating" : "fortnitePoints";

  selectors.leaderList.innerHTML = leaderboardPlayers()
    .slice(0, 7)
    .map(
      (player, index) => `
        <button class="leader-row" data-player="${player.id}">
          <span class="leader-rank">${index + 1}</span>
          <span class="leader-main"><strong>${state.game === "cs2" ? player.team : player.nick}</strong><span class="leader-meta">${player.rank}</span></span>
          <span class="leader-points">${formatNumber(player[key])}</span>
        </button>
      `,
    )
    .join("");

  selectors.leaderboardTable.innerHTML = leaderboardPlayers()
    .map(
      (player, index) => `
        <button class="leader-row" data-player="${player.id}">
          <span class="leader-rank">#${index + 1}</span>
          <span class="leader-main"><strong>${player.nick}</strong><span class="leader-meta">${player.telegram}</span></span>
          <span class="leader-points">${formatNumber(player[key])}</span>
          <span class="hide-mobile">${player.rank}</span>
          <span class="pill hide-mobile">${state.game === "cs2" ? player.kd : player.pr}</span>
        </button>
      `,
    )
    .join("");
}

function renderFeaturedTournament() {
  const tournament = gameTournaments()[0];
  if (!tournament) return;

  selectors.featuredTournament.innerHTML = `
    <h3>${tournament.name}</h3>
    <p class="muted">${tournament.mode} / ${tournament.slots} / ${tournament.prize}</p>
    ${state.game === "cs2" ? renderBracketPreview() : renderCodePanelMarkup(tournament)}
  `;
}

function renderBracketPreview() {
  const qf = state.bracket.filter((match) => match.round === "Quarter-finals").slice(0, 2);
  const sf = state.bracket.find((match) => match.round === "Semi-finals");
  const final = state.bracket.find((match) => match.round === "Final");

  return `
    <div class="bracket-preview">
      <div class="bracket-column">
        ${qf.map(renderSmallMatch).join("")}
      </div>
      <div class="bracket-column">${renderSmallMatch(sf)}</div>
      <div class="winner-card">
        <strong>${final.teamA}</strong>
        <span class="score-win">WINNER</span>
      </div>
    </div>
  `;
}

function renderSmallMatch(match) {
  return `
    <div class="bracket-match">
      <div><strong>${match.teamA}</strong><span class="score-win">${match.scoreA || ""}</span></div>
      <div><strong>${match.teamB}</strong><span class="score-loss">${match.scoreB || ""}</span></div>
    </div>
  `;
}

function renderRecentMatches() {
  selectors.recentMatches.innerHTML = state.matches
    .map(([name, map, result, kd]) => {
      const won = result.startsWith("13");
      return `
        <div class="match-row">
          <strong>${name}</strong>
          <span class="match-meta">${map}</span>
          <span class="${won ? "result-win" : "result-loss"}">${result}</span>
          <span class="hide-mobile">${kd}</span>
        </div>
      `;
    })
    .join("");
}

function renderUpcoming() {
  selectors.upcomingList.innerHTML = gameTournaments()
    .map(
      (tournament) => `
        <article class="upcoming-item">
          <div class="thumb" style="background-image: url('${tournament.image}')"></div>
          <div>
            <strong>${tournament.name}</strong>
            <div class="match-meta">${tournament.mode} / ${tournament.slots}</div>
          </div>
          <div>
            <strong>${tournament.date.split(" ").slice(0, 2).join(" ")}</strong>
            <button class="secondary-action" data-register="${tournament.id}">Участвовать</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderCodePanelMarkup(tournament) {
  const isRegistered = state.registeredTournamentId === tournament.id;
  return `
    <div class="condition-row"><span>Подписка на Telegram</span><strong class="result-win">Проверено</strong></div>
    <div class="condition-row"><span>Подписка на Twitch</span><strong class="result-win">Проверено</strong></div>
    <div class="code-box">
      <span>${state.game === "cs2" ? "КОД КОМНАТЫ" : "КОД ОСТРОВА"}</span>
      <strong>${isRegistered ? tournament.code : "LOCKED"}</strong>
      <button class="secondary-action" data-register="${tournament.id}">
        ${isRegistered ? "Код получен" : "Получить код"}
      </button>
    </div>
  `;
}

function renderCodePanel() {
  const tournament = gameTournaments()[0];
  selectors.codePanelTitle.textContent = state.game === "cs2" ? "Быстрые действия" : "Получить код острова";
  selectors.codePanel.innerHTML =
    state.game === "cs2"
      ? `
        <div class="quick-action"><span class="pill">2v2</span><div><strong>Найти команду</strong><div class="match-meta">Найти тиммейта для турниров</div></div></div>
        <div class="quick-action"><span class="pill">+</span><div><strong>Создать команду</strong><div class="match-meta">Собери свою команду</div></div></div>
        <div class="quick-action"><span class="pill">?</span><div><strong>Правила турниров</strong><div class="match-meta">Ознакомься с правилами</div></div></div>
      `
      : renderCodePanelMarkup(tournament);
}

function renderTournaments() {
  selectors.tournamentGrid.innerHTML = gameTournaments()
    .map(
      (tournament) => `
        <article class="tournament-card">
          <div class="thumb" style="background-image: url('${tournament.image}')"></div>
          <div class="card-meta">
            <span class="pill">${tournament.game}</span>
            <span class="pill">${tournament.status}</span>
          </div>
          <h3>${tournament.name}</h3>
          <p class="muted">${tournament.mode} / ${tournament.slots} / ${tournament.date}</p>
          <p class="muted">${tournament.prize}</p>
          <div class="card-actions">
            <button class="primary-action" data-register="${tournament.id}">Участвовать</button>
            <button class="secondary-action" data-code="${tournament.id}">Код</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function filteredPlayers() {
  const query = state.playerSearch.trim().toLowerCase();
  if (!query) return state.players;
  return state.players.filter((player) =>
    [player.nick, player.team, player.telegram, player.epic, player.steam].join(" ").toLowerCase().includes(query),
  );
}

function renderPlayers() {
  const players = filteredPlayers();
  selectors.playerResults.innerHTML = players
    .map(
      (player) => `
        <button class="player-row ${player.id === state.selectedPlayerId ? "active" : ""}" data-player="${player.id}">
          <span><strong>${player.nick}</strong><span>${player.telegram}</span></span>
          <span class="pill">${state.game === "cs2" ? player.cs2Rating : player.fortnitePoints}</span>
        </button>
      `,
    )
    .join("");

  const player = state.players.find((item) => item.id === state.selectedPlayerId) || players[0];
  if (!player) {
    selectors.playerDetails.innerHTML = `<p class="muted">Игрок не найден.</p>`;
    return;
  }

  selectors.playerDetails.innerHTML = `
    <div class="player-details-head">
      <div>
        <p class="eyebrow">Public profile</p>
        <h2>${player.nick}</h2>
        <p class="muted">${player.team} / уровень ${player.level}</p>
      </div>
      <img class="avatar" src="assets/avatar-akkerman.png" alt="${player.nick}" />
    </div>
    <div class="identity-grid">
      <div><span>Telegram</span><strong>${player.telegram}</strong></div>
      <div><span>Epic</span><strong>${player.epic}</strong></div>
      <div><span>Steam</span><strong>${player.steam}</strong></div>
      <div><span>Rank</span><strong>${player.rank}</strong></div>
      <div><span>ECS rating</span><strong>${state.game === "cs2" ? player.cs2Rating : player.fortnitePoints}</strong></div>
    </div>
    <div class="external-card">
      <p class="eyebrow">${state.game === "cs2" ? "CS2 stats" : "FortniteTracker ready"}</p>
      <div class="external-grid">
        <div><span>K/D</span><strong>${player.kd}</strong></div>
        <div><span>Matches</span><strong>${player.matches}</strong></div>
        <div><span>PR</span><strong>${player.pr}</strong></div>
        <div><span>Placements</span><strong>${player.placements}</strong></div>
        <div><span>Earnings</span><strong>${player.earnings}</strong></div>
      </div>
    </div>
  `;
}

function renderBracket() {
  selectors.bracketBoard.innerHTML = state.bracket
    .map(
      (match) => `
        <article class="match-card">
          <p class="eyebrow">${match.round}</p>
          <h3>Match ${match.id}</h3>
          <div><strong>${match.teamA}</strong><span class="score-win">${match.scoreA || "TBD"}</span></div>
          <div><strong>${match.teamB}</strong><span class="score-loss">${match.scoreB || "TBD"}</span></div>
          <span class="pill">${match.status}</span>
        </article>
      `,
    )
    .join("");
}

function renderAdminSelects() {
  selectors.codeTournamentSelect.innerHTML = state.tournaments
    .map((tournament) => `<option value="${tournament.id}">${tournament.name} / ${tournament.code}</option>`)
    .join("");
  selectors.matchSelect.innerHTML = state.bracket
    .map((match) => `<option value="${match.id}">Match ${match.id} / ${match.round}</option>`)
    .join("");
}

function registerForTournament(id) {
  const tournament = state.tournaments.find((item) => item.id === id);
  if (!tournament) return;
  state.registeredTournamentId = id;
  renderAll();
  toast(`Вы участвуете: ${tournament.name}. Код открыт.`);
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-view]");
    const gameButton = event.target.closest("[data-game-switch]");
    const registerButton = event.target.closest("[data-register]");
    const codeButton = event.target.closest("[data-code]");
    const playerButton = event.target.closest("[data-player]");

    if (viewButton) setView(viewButton.dataset.view);
    if (gameButton) setGame(gameButton.dataset.gameSwitch);
    if (registerButton) registerForTournament(Number(registerButton.dataset.register));
    if (codeButton) {
      const tournament = state.tournaments.find((item) => item.id === Number(codeButton.dataset.code));
      toast(state.registeredTournamentId === tournament.id ? `Код: ${tournament.code}` : "Сначала зарегистрируйся на турнир.");
    }
    if (playerButton) {
      state.selectedPlayerId = Number(playerButton.dataset.player);
      renderPlayers();
      setView("players");
    }
  });

  document.querySelector("#quickJoin").addEventListener("click", () => {
    registerForTournament(gameTournaments()[0].id);
  });

  selectors.playerSearch.addEventListener("input", (event) => {
    state.playerSearch = event.target.value;
    renderPlayers();
  });

  selectors.adminForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(selectors.adminForm);
    state.tournaments.unshift({
      id: Date.now(),
      game: form.get("game"),
      name: form.get("name"),
      mode: form.get("game") === "CS2" ? "2v2" : "Duos",
      date: form.get("date"),
      slots: "0/32",
      prize: form.get("prize"),
      code: form.get("code"),
      status: "Открыт",
      image: form.get("game") === "CS2" ? "assets/thumb-cs2-daily.png" : "assets/thumb-fortnite-community.png",
    });
    renderAll();
    setView("tournaments");
    toast("Турнир добавлен.");
  });

  selectors.codeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(selectors.codeForm);
    const tournament = state.tournaments.find((item) => item.id === Number(form.get("tournamentId")));
    if (!tournament) return;
    tournament.code = form.get("code").toString().trim();
    renderAll();
    toast(`Код обновлен: ${tournament.code}`);
  });

  selectors.bracketForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(selectors.bracketForm);
    const match = state.bracket.find((item) => item.id === Number(form.get("matchId")));
    if (!match) return;
    const [scoreA, scoreB] = form.get("score").toString().split(":").map((value) => Number(value.trim()));
    match.teamA = form.get("teamA").toString().trim();
    match.teamB = form.get("teamB").toString().trim();
    match.scoreA = Number.isFinite(scoreA) ? scoreA : 0;
    match.scoreB = Number.isFinite(scoreB) ? scoreB : 0;
    match.status = form.get("status");
    renderAll();
    setView("matches");
    toast(`Match ${match.id} обновлен.`);
  });
}

function renderAll() {
  renderHero();
  renderStatStrip();
  renderMyStats();
  renderLeaders();
  renderFeaturedTournament();
  renderRecentMatches();
  renderUpcoming();
  renderCodePanel();
  renderTournaments();
  renderPlayers();
  renderBracket();
  renderAdminSelects();
}

function boot() {
  const initialData = window.ecsApi.getInitialData();
  state.user = initialData.user;
  state.tournaments = initialData.tournaments;
  state.players = initialData.players;
  state.matches = initialData.matches;
  state.bracket = initialData.bracket;

  const tg = window.Telegram?.WebApp;
  tg?.ready?.();
  const profile = tg?.initDataUnsafe?.user;
  if (profile?.username) {
    state.user.name = profile.username;
  }
  document.querySelector("#miniProfileName").textContent = state.user.name;
  bindEvents();
  renderAll();
}

boot();
