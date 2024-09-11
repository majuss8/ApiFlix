const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1MzdjNDFiZGRhNGE5OWExZjZiNjE4NWQxOTVhYTJkNSIsIm5iZiI6MTcyNTk5Mjc0NS45ODYyNDgsInN1YiI6IjY2ZTA4ZDEwMTNjNDQ4NTA4Y2Y4Y2U2ZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._8liNkDW-IdAGc3tqyupBPiOKNKWhXLtEk6ScGizKyY'
    }
};

let filmes = [];
let paginaAtual = 0;

// requisição que traz uma lista de filmes
fetch('https://api.themoviedb.org/3/movie/popular', options)
    .then(response => response.json())
    .then(function (respostaFormatada) {
        filmes = respostaFormatada.results;
        vizualizacaoDeFilmes(filmes.slice(0, 5)); // mostra a primeira página
    })
    .catch(err => console.error(err));

// função que preenche os campos de cada filme na div 'movie'
const filme = (filme) => {
    const divMovie = document.createElement('div');
    divMovie.className = 'movie';

    const divMovieInfo = document.createElement('div');
    divMovieInfo.className = 'movie__info';

    const spanTitle = document.createElement('span');
    spanTitle.className = 'movie__title';

    const spanRating = document.createElement('span');
    spanRating.className = 'movie__rating';

    const imgElement = document.createElement('img');
    imgElement.src = "./assets/estrela.svg";
    imgElement.alt = "Estrela";

    divMovie.style.backgroundImage = `url(https://image.tmdb.org/t/p/w500${filme.poster_path})`;
    spanTitle.textContent = filme.title;
    spanRating.textContent = filme.vote_average;
    
    divMovie.appendChild(divMovieInfo);
    divMovieInfo.appendChild(spanTitle);
    divMovieInfo.appendChild(spanRating);
    spanRating.appendChild(imgElement);
    
    divMovie.setAttribute('data-id', filme.id);

    divMovie.addEventListener('click', () => {
        openModal(filme.id);
    });

    return divMovie;
}

// função apresenta os filmes
const vizualizacaoDeFilmes = (filmesPagina) => {
    const divMovies = document.querySelector('.movies');
    divMovies.innerHTML = ''; // limpa os filmes anteriores

    filmesPagina.forEach(filmeItem => {
        const posterFilme = filme(filmeItem);
        divMovies.appendChild(posterFilme);
    });
}

// função que atualiza os filmes da página atual
const atualizarPagina = () => {
    const inicio = paginaAtual * 5;
    const fim = inicio + 5;
    vizualizacaoDeFilmes(filmes.slice(inicio, fim));
}

// botão - anterior
const btnPrev = document.querySelector('.btn-prev');
btnPrev.onclick = () => {
    if (paginaAtual > 0) {
        paginaAtual--;
    } else {
        paginaAtual = 3; // se estiver na página 0, vai para a última página (3)
    }
    atualizarPagina();
}

// botão - próximo
const btnNext = document.querySelector('.btn-next');
btnNext.onclick = () => {
    if (paginaAtual < 3) {
        paginaAtual++;
    } else {
        paginaAtual = 0; // se estiver na página 3, vai para a primeira página (0)
    }
    atualizarPagina();
}

const inputBusca = document.querySelector('.input');

inputBusca.addEventListener('keydown', function(event) {
    // verifica se a tecla "Enter" foi pressionada
    if (event.key === 'Enter') {
        event.preventDefault();  // evita o comportamento padrão (caso exista)
        const query = inputBusca.value.trim(); // remove espaços em branco no início e no final

        // se o campo input tiver valor, faz a busca; se não, carrega filmes os populares
        if (query !== "") {
            buscarFilmes(query);
        } else {
            carregarFilmesPopulares();
        }

        // limpa o campo input
        inputBusca.value = '';
    }
});

// unção que busca os filmes com base no input
const buscarFilmes = (query) => {
    const url = `https://tmdb-proxy.cubos-academy.workers.dev/3/search/movie?language=pt-BR&include_adult=false&query=${query}`;
    
    fetch(url)
        .then(response => response.json())
        .then(respostaFormatada => {
            filmes = respostaFormatada.results;
            vizualizacaoDeFilmes(filmes.slice(0, 5));
        })
        .catch(err => console.error(err));
};

// função que carrega os filmes populares 
const carregarFilmesPopulares = () => {
    const url = 'https://tmdb-proxy.cubos-academy.workers.dev/3/movie/popular?language=pt-BR';

    fetch(url, options)
        .then(response => response.json())
        .then(respostaFormatada => {
            filmes = respostaFormatada.results;
        vizualizacaoDeFilmes(filmes.slice(0, 5));
        })
        .catch(err => console.error(err));
};

// função que formata a data de lançamento (release_date)
const formatarData = (data) => {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
};

// função que pega o "Filme do Dia"
const carregarFilmeDoDia = async () => {
    try {
        // requisição para o endpoint geral
        const respostaGeral = await fetch('https://tmdb-proxy.cubos-academy.workers.dev/3/movie/436969?language=pt-BR');
        const dadosFilme = await respostaGeral.json();

        // preenche a área de "Filme do Dia"
        const highlightVideo = document.querySelector('.highlight__video');
        const highlightTitle = document.querySelector('.highlight__title');
        const highlightRating = document.querySelector('.highlight__rating');
        const highlightGenres = document.querySelector('.highlight__genres');
        const highlightLaunch = document.querySelector('.highlight__launch');
        const highlightDescription = document.querySelector('.highlight__description');

        // define o background do vídeo
        highlightVideo.style.backgroundImage = `url(${dadosFilme.backdrop_path})`;

        // preenche as demais informações do filme
        highlightTitle.textContent = dadosFilme.title;
        highlightRating.textContent = dadosFilme.vote_average;

        // concatena os gêneros
        const generos = dadosFilme.genres.map(genero => genero.name).join(', ');
        highlightGenres.textContent = generos;

        // formata a data de lançamento
        highlightLaunch.textContent = formatarData(dadosFilme.release_date);
        highlightDescription.textContent = dadosFilme.overview;

        // requisição para o endpoint de vídeos
        const respostaVideos = await fetch('https://tmdb-proxy.cubos-academy.workers.dev/3/movie/436969/videos?language=pt-BR');
        const dadosVideos = await respostaVideos.json();

        // pega o primeiro vídeo do array de resultados e define o link para o trailer
        const highlightVideoLink = document.querySelector('.highlight__video-link');
        if (dadosVideos.results.length > 0) {
            const trailer = dadosVideos.results[0];
            highlightVideoLink.href = `https://www.youtube.com/watch?v=${trailer.key}`;
        }

    } catch (error) {
        console.error("Erro ao carregar o Filme do Dia:", error);
    }
};

// chama a função ao carregar a página
carregarFilmeDoDia();

const modal = document.querySelector('.modal');
const modalClose = document.querySelector('.modal__close');

// função que abre o modal
function openModal(movieId) {
  fetch(`https://tmdb-proxy.cubos-academy.workers.dev/3/movie/${movieId}?language=pt-BR`)
    .then(response => response.json())
    .then(data => {
      // preenche o modal com as informações do filme
      document.querySelector('.modal__title').textContent = data.title;
      document.querySelector('.modal__img').src = `https://image.tmdb.org/t/p/original${data.backdrop_path}`;
      document.querySelector('.modal__description').textContent = data.overview;
      document.querySelector('.modal__average').textContent = data.vote_average;

      // preenche os gêneros
      const genresContainer = document.querySelector('.modal__genres');
      genresContainer.innerHTML = ''; // Limpar gêneros anteriores
      data.genres.forEach(genre => {
        const span = document.createElement('span');
        span.classList.add('modal__genre');
        span.textContent = genre.name;
        genresContainer.appendChild(span);
      });

      // mostra o modal
      modal.classList.remove('hidden');
    })
    .catch(error => console.error('Erro ao buscar dados do filme:', error));
}

// função que fecha o modal
function closeModal() {
  modal.classList.add('hidden');
}

// ouvintes de eventos que fecham o modal
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  // fechar modal se o clique for fora do conteúdo
  if (event.target === modal) {
    closeModal();
  }
});


// ouvintes de eventos que abrem o modal em cada filme
document.querySelectorAll('.movie').forEach(movie => {
    movie.addEventListener('click', () => {
      const movieId = movie.dataset.id; // id do filme armazenado no atributo data-id
      openModal(movieId);
    });
});

document.querySelector('.btn-theme').addEventListener('click', () => {
    // verifica se o tema atual é o escuro
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
      // altera para o tema claro
        document.documentElement.setAttribute('data-theme', 'light');

        const setaDireita = document.querySelector('.btn-next');
        setaDireita.src = './assets/seta-direita-preta.svg';

        const setaEsquerda = document.querySelector('.btn-prev');
        setaEsquerda.src = './assets/seta-esquerda-preta.svg';

    } else {
      // altera para o tema escuro
        document.documentElement.setAttribute('data-theme', 'dark');

        const setaDireita = document.querySelector('.btn-next');
        setaDireita.src = './assets/seta-direita-branca.svg';

        const setaEsquerda = document.querySelector('.btn-prev');
        setaEsquerda.src = './assets/seta-esquerda-branca.svg';
    }
});