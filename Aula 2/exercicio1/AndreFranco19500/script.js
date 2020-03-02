function lerInput() {
    var texto = document.getElementById("numero").value;
    if(!texto.length) alert("Sem conteudo no Input");
    document.getElementById("texto").innerText = texto;
}