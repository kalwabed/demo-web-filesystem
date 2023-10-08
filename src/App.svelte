<script>
import { onMount } from 'svelte'

let fileName = ''
let fileContent = ''
let showedFileContent = ''
let files = []

async function getFileHandle(name, props) {
  const dirHandle = await getDirHandle()
  const fileHandle = await dirHandle.getFileHandle(name, props)

  return fileHandle
}

async function getDirHandle(props) {
  const opfsRoot = await navigator.storage.getDirectory()
  const dirHandle = await opfsRoot.getDirectoryHandle('main', {create:true, ...props})

  return dirHandle
}

async function createFile() {
  const fileHandle = await getFileHandle(fileName,{create: true})
  await showListOfFile()
  console.log(fileHandle)
  return fileHandle
}

async function showListOfFile() {
  const dirHandle = await getDirHandle()
  const arr=[]

  for await (let name of dirHandle.keys()) {
    arr.push(name)
  }

  files = arr
}

async function getFile(name) {
  const fileHandle = await getFileHandle(name??fileName)
  const file = await fileHandle.getFile()
  
  return file
}

async function writeToFile() {
  const file = await getFileHandle()
  const writable = await file.createWritable()

  await writable.write(fileContent)
  await writable.close()
}

async function showFileContent(name) {
  const file = await getFile(name)
  const text= await file.text()

  showedFileContent = text
}

onMount(async ()=> {
  await showListOfFile()
  console.log(files)
})
</script>

<main>
  <ul>
    {#each files as filename}
      <li>
        <button on:click={()=>showFileContent(filename)}>{filename}</button>
      </li>
    {/each}
  </ul>
  <input bind:value={fileName} placeholder="Input file name"  />
  <input bind:value={fileContent} placeholder="Input content"  />
  <button on:click={createFile}>Add file</button>
  <button on:click={writeToFile}>Insert to file</button>
  <button on:click={getFile}>Get file</button>
  <textarea bind:value={showedFileContent} />
</main>
