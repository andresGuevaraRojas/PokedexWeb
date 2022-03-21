const keyUp = document.getElementById('keyUp')
const keyRight = document.getElementById('keyRight')
const keyDown = document.getElementById('keyDown')
const keyLeft = document.getElementById('keyLeft')
const loadingDialog = document.getElementById("loadingDialog")
const imageScreen = document.getElementById("imageScreen")
const pokemonNameText = document.getElementById("pokemonNameText")
const pokemonWeightValue = document.getElementById("pokemonWeightValue")
const pokemonHeightValue = document.getElementById("pokemonHeightValue")
const pokemonInput = document.getElementById("pokemonInput")
const searchButton = document.getElementById("search")
const lisTypes = document.getElementById('listTypes')
const listMovs = document.getElementById('listMovs')
const lisStasts = document.getElementById('listStats')

let pokemonCounter = 1;
let evolCount = -1;
let evolves = []


keyUp.addEventListener('click',async function(){         
    resetLists()
    if(evolCount<evolves.length-1){
        evolCount++
    }      
    loadPokemonEvol(evolCount)
})
keyRight.addEventListener('click',async function(){

    setName('')
    resetEvolvesData()
    resetLists()
    pokemonCounter++
    await loadPokemon()
})
keyDown.addEventListener('click', async function(){
    resetLists()
    if(evolCount>0){
        evolCount--
    }      
    loadPokemonEvol(evolCount)
})
keyLeft.addEventListener('click',async function(){
    setName('')
    resetEvolvesData()
    resetLists()
    if(pokemonCounter<1){
        return
    }
    if(pokemonCounter>1){
        pokemonCounter--; 
    }    
    await loadPokemon()
})

searchButton.addEventListener('click',async event=>{   
    
    resetEvolvesData()    
    const pokemon = pokemonInput.value
    if(pokemon.trim() == ''){
        return
    }
    resetLists()
    try {
        await searchPokemon(pokemon.toLowerCase())
    } catch (error) {
        loadingDialog.setAttribute('class','loadingDialog-show')
        loadingDialog.innerHTML = 'Pokemon no encontrado 😓'
        setImage('')   
        setName('')        
        setPokemonHeightValue('?')
        setPokemonWeightValue('?')  
        resetLists()
    }   
})

async function searchPokemon(nameOrId){
    loadingDialog.setAttribute('class','loadingDialog-show')
    loadingDialog.innerHTML = 'Buscando pokemon...'

    const pokemon = await getPokemon(nameOrId);

    setName(pokemon.name)
    setImage(pokemon.sprites.front_default)  
    setPokemonHeightValue(pokemon.height)
    setPokemonWeightValue(pokemon.weight)  
    setListTypes(pokemon.types)
    setListMovs(pokemon.moves)
    setListStats(pokemon.stats)
    loadingDialog.setAttribute('class','loadingDialog-hide')
    loadingDialog.innerHTML = ''     
}
loadPokemon()
async function loadPokemon(){          
    evolCount++

    loadingDialog.setAttribute('class','loadingDialog-show')
    loadingDialog.innerHTML = 'Cargando pokemon...'

    evolves = await getEvolves(pokemonCounter)          
    const pokemon = evolves[evolCount] 


    setName(pokemon.name)
    setImage(pokemon.sprites.front_default)  
    setPokemonHeightValue(pokemon.height)
    setPokemonWeightValue(pokemon.weight)  
    setListTypes(pokemon.types)
    setListMovs(pokemon.moves)
    setListStats(pokemon.stats)

    loadingDialog.setAttribute('class','loadingDialog-hide')
    loadingDialog.innerHTML = 'Cargando pokemon...'    
}

function loadPokemonEvol(evolCount){
    loadingDialog.setAttribute('class','loadingDialog-show')
    loadingDialog.innerText = 'Cargando evolucion...'
    const pokemon = evolves[evolCount]
    setImage(pokemon.sprites.front_default)
    setName(pokemon.name)
    setPokemonHeightValue(pokemon.height)
    setPokemonWeightValue(pokemon.weight)
    setListTypes(pokemon.types)
    setListMovs(pokemon.moves)
    setListStats(pokemon.stats)
    
    loadingDialog.setAttribute('class','loadingDialog-hide')
    loadingDialog.innerText = ''
}
async function getEvolutionChain(id){
    const request = await fetch(`https://pokeapi.co/api/v2/evolution-chain/${id}/`);    
    const data = await request.json()
    return data;
}
async function getPokemon(nameOrId){
    const request = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`)
    const pokemon = await request.json()
    
    return pokemon
}


function setImage(src){
    imageScreen.setAttribute('src',src);
}

function setName(name){
    pokemonNameText.innerText = name.toUpperCase()
}
function setListTypes(types){   
    types.forEach(type => {
        let li = document.createElement('li')
        li.innerText = type.type.name.toUpperCase()
        lisTypes.appendChild(li)        
    });
}
function setListMovs(movs){   
    movs.forEach(mov => {
        let li = document.createElement('li')
        li.innerText = mov.move.name.toUpperCase()
        listMovs.appendChild(li)        
    });
}
function setListStats(stats){   
    stats.forEach(stat => {
        let statLi = document.createElement('li')
        statLi.setAttribute('class','stat')

        let statBar = document.createElement('div')               
        statBar.setAttribute('class','stat__bar')

        let statBarInner = document.createElement('div')
        statBarInner.setAttribute('class','stat__bar__inner')
        statBarInner.style.height = `${stat.base_stat}px`

        let statData = document.createElement('div')
        statData.setAttribute('class','stat__data')

        let statValue = document.createElement('span')
        statValue.innerText = stat.base_stat

        let statName = document.createElement('span')
        statName.innerText = stat.stat.name


        statData.appendChild(statValue)
        statData.appendChild(statName)

        statBar.appendChild(statBarInner)

        statLi.appendChild(statBar)
        statLi.appendChild(statData)        
        
        lisStasts.appendChild(statLi)
    });
}
function setPokemonHeightValue(value){
    pokemonHeightValue.innerHTML = value
}
function setPokemonWeightValue(value){
    pokemonWeightValue.innerHTML = value
}
function resetEvolvesData(){    
    evolves = [];
    evolCount = -1;
}
function resetLists(){
    lisTypes.innerHTML = ''
    listMovs.innerHTML = ''
    lisStasts.innerHTML = ''
}


async function getEvolves(id){

    const evolucionChain = await getEvolutionChain(id);
    const chain = evolucionChain.chain;
    let evolves = []
    if(chain.evolves_to.length<1){
        return []
    }    
    let root = chain.evolves_to[0]
    let temp = root
    while(temp){
        console.log(temp)
        evolves.push(temp)
        temp = temp.evolves_to[0]
    }       

    evolves = [chain,...evolves]

    let promises = evolves.map(pokemon=>getPokemon(pokemon.species.name))
    let pokemons = await Promise.all(promises)

    return pokemons
}