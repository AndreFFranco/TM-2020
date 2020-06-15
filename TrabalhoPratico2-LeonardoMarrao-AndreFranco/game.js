var game; //criacao do proprio jogo
var gameOptions = { //vamos criar aqui em baixo a configuração do jogo

    // gravidade do passaro
    birdGravity: 800,

    // velocidade que os pipes vao a esquerda
    birdSpeed: 125,

    // altura que ele sobe quando clicamos o mouse
    birdFlapPower: 300,

    // altura minima de um cano
    minPipeHeight: 50,

    // distancia entre o pipe da esquerda com o pipe da direita
    pipeDistance: [220, 280],

    // distancia entre o pipe de cima  e o pipe de baixo
    pipeHole: [100, 130],

    // onde vamos guardar o melhor score do usuario
    localStorageName: 'bestFlappyScore'
}
window.onload = function() {

    let gameConfig = {

        type: Phaser.AUTO,
        backgroundColor:0x87ceeb, //definir cor azul do fundo
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: 'thegame',
            width: 320, //largura do ecrã
            height: 480 //altura do ecra
        },
        pixelArt: true,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {
                    y: 0
                }
            }
        },

        scene: playGame
    }
    game = new Phaser.Game(gameConfig); //vamos aplicar no game a nossa config criada acima

    window.focus();
}
class playGame extends Phaser.Scene{

    constructor(){
        super('PlayGame');
    }
    preload(){ //vamos agora carregar os sprites do passaro(jogador), dos canos e da musica de fundo

        this.load.image('bird', 'bird.png');
        this.load.image('pipe', 'pipe.png');
        this.load.audio('musica', 'musica.mp3');

    }

    create(){

        this.pipeGroup = this.physics.add.group(); //aqui estaremos empurrando os pipes para a esquerda
        this.pipePool = [];
        for(let i = 0; i < 4; i++){

            this.pipePool.push(this.pipeGroup.create(0, 0, 'pipe'));
            this.pipePool.push(this.pipeGroup.create(0, 0, 'pipe'));
            this.placePipes(false);
        }

        this.pipeGroup.setVelocityX(-gameOptions.birdSpeed); //os pipes que se movem em direçao ao passaro com a birdspeed
        this.bird = this.physics.add.sprite(80, game.config.height / 2, 'bird'); //estamos adicionando o passaro na altura da metade do ecra, carregaremos o sprite do passaro tbm
        this.bird.body.gravity.y = gameOptions.birdGravity; //adicionando gravidade ao passaro(velocidade que cai)
        this.input.on('pointerdown', this.flap, this); //quando clicamos com o botao direito do rato, executamos a funcao "flap"
        this.score = 0; //iniciaremos o score em 0
        this.topScore = localStorage.getItem(gameOptions.localStorageName) == null ? 0 : localStorage.getItem(gameOptions.localStorageName); //localStorageGame é onde iremos guardar o melhor score
        this.scoreText = this.add.text(10, 10, '');
        this.updateScore(this.score);

        this.music= this.sound.add("musica"); //adicionar musica
                     this.music.volume = 0.2;
                     this.music.play();
                     this.music.loop = true;


    }
    updateScore(inc){  //essa funcao vai servir para alterar o score do usuario

        this.score += inc;
        this.scoreText.text = 'Score: ' + this.score + '\nBest: ' + this.topScore;

    }
    placePipes(addScore){ //essa funcao vai servir para adicionarmos pipes no jogo e para cada vez que o usuario passar entre os pipes, somarmos um valor no score
        let rightmost = this.getRightmostPipe();
        let pipeHoleHeight = Phaser.Math.Between(gameOptions.pipeHole[0], gameOptions.pipeHole[1]); //"pipe[0]" é o pipe de baixo e "pipe[1]" é o pipe de cima
        let pipeHolePosition = Phaser.Math.Between(gameOptions.minPipeHeight + pipeHoleHeight / 2, game.config.height - gameOptions.minPipeHeight - pipeHoleHeight / 2); //vamos definir as posicoes dos pipes de maneira aleatoria
        this.pipePool[0].x = rightmost + this.pipePool[0].getBounds().width + Phaser.Math.Between(gameOptions.pipeDistance[0], gameOptions.pipeDistance[1]); //definir a posicao em x do pipe de baixo
        this.pipePool[0].y = pipeHolePosition - pipeHoleHeight / 2; //definirmos a altura do pipe de baixo
        this.pipePool[0].setOrigin(0, 1); //agora colocaremos no jogo o pipe de baixo
        this.pipePool[1].x = this.pipePool[0].x;
        this.pipePool[1].y = pipeHolePosition + pipeHoleHeight / 2;
        this.pipePool[1].setOrigin(0, 0);
        this.pipePool = [];
        if(addScore){
            this.updateScore(1); //iremos adicionar um ponto ao score quando ele passa pelo cano
        }
    }


    flap(){ //funcao serve para fazermos o passaro voar quando clicamos, pegamos a posicao dele em y e diminuimos pelo "flapPower" para ele subir no ecra

        this.bird.body.velocity.y = -gameOptions.birdFlapPower;
    }

    getRightmostPipe(){
        let rightmostPipe = 0;
        this.pipeGroup.getChildren().forEach(function(pipe){
            rightmostPipe = Math.max(rightmostPipe, pipe.x);
        });
        return rightmostPipe;
    }


    update(){ //funcao que diz quando o passaro colidir com os canos, convocar a funcao "this.die" que eh a funcao que ele morre e reseta

        this.physics.world.collide(this.bird, this.pipeGroup, function(){ //quando o passaro e o pipe colidirem, o passaro invoca a funcao "this.die"
            this.die();
        }, null, this);
        if(this.bird.y > game.config.height || this.bird.y < 0){//se o passaro tocar no teto ou no chao, invocaremos a funcao "this.die"
            this.die();
        }
        this.pipeGroup.getChildren().forEach(function(pipe){ //so gera outro pipe, quando o passaro tiver passado do anterior
            if(pipe.getBounds().right < 0){
                this.pipePool.push(pipe); //empurra o pipe que ja passamos para esquerda
                if(this.pipePool.length == 2){
                    this.placePipes(true);
                }
            }
        }, this)
    }
    die(){ //funcao que mostra o que acontece quando o passaro morre, ele reseta a cena

        localStorage.setItem(gameOptions.localStorageName, Math.max(this.score, this.topScore)); // guarda os melhores scores
        this.scene.start('PlayGame'); //recomeca o jogo

    }
}
