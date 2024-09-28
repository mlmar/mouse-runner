export default [
    'crimson', 
    'green', 
    'orange',
    'lightseagreen',
    'darkblue',
    'magenta',
    'beige'
].reduce((acc, curr) => {
    return {
        ...acc,
        [curr.toUpperCase()]: curr, 
    }
}, {});