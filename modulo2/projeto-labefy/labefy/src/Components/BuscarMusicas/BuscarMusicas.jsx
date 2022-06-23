import React from "react";
import { BoxRecomendados, BlocoPlayer, NomePlayList, TituloBusca, Conainer } from "./style";
import axios from "axios";
import Loader from "../Loader/Loader";
import PlaylistRecomendada from "../PlaylistRecomendada/PlaylistRecomendada";
export default class BuscarMusicas extends React.Component {

    state = {
        playlists: [],
        id: "Escolha",
        musicas: [],
        pesquisa: "Escolha",
        inputPesquisa: "",
        loading: false,
    }

    componentDidMount = () => {
        this.getPlayLists()
    }

    getPlayLists = () => {
        axios.get(`https://us-central1-labenu-apis.cloudfunctions.net/labefy/playlists`, {
            headers: {
                Authorization: "jonatas-felix-freire"
            }
        }).then(response => {
            this.setState({ playlists: response.data.result.list })
        })
    }

    getPlayListMusic = (id) => {
        if (id !== "Escolha") {
            axios.get(`https://us-central1-labenu-apis.cloudfunctions.net/labefy/playlists/${id}/tracks`, {
                headers: {
                    Authorization: "jonatas-felix-freire"
                }
            }).then(response => {
                this.setState({ musicas: response.data.result.tracks })
                console.log(response.data.result.tracks)
                this.setState({loading: false})
            }).catch(error => {
                console.log(error.data.message)
            })
        } else {
            alert("Selecione uma Playlist!")
        }

    }

    pegarIdLista = (e) => {
        this.setState({ id: e.target.value })
        this.setState({ pesquisa: e.target.value })
        this.getPlayListMusic(e.target.value)
        console.log(e.target.value)
        this.setState({loading: true})

    }

    pegarValorInput = (e) => {
        this.setState({ inputPesquisa: e.target.value })
        this.getPlayListMusic(this.state.id)
        this.setState({loading: false})
    }

    render() {

        const renderizarPlaylists = this.state.playlists.map(o => {
            return (
                <option value={o.id} key={o.id}>{o.name}</option>
            )
        })

        const renderizarMusicas = this.state.musicas
            .filter(musica => {
                return (
                    musica.name.toLowerCase().includes(this.state.inputPesquisa.toLowerCase()) ||
                    musica.artist.toLowerCase().includes(this.state.inputPesquisa.toLowerCase())

                )
            })
            .map(o => {
                const link = `${o.url.substring(32)}`
                return (
                    <BoxRecomendados key={o.id}>
                        <BlocoPlayer className="">
                            <iframe title={o.name} width="100%" height="100%"
                                src={`https://www.youtube.com/embed/${link}`}>
                            </iframe>
                        </BlocoPlayer>
                        <NomePlayList>{o.artist} - {o.name}</NomePlayList>
                    </BoxRecomendados>
                )
            })

        return (
            <Conainer>
                <TituloBusca>Buscar</TituloBusca>
                <form>

                    <input type="text"
                        value={this.state.inputPesquisa}
                        onChange={this.pegarValorInput}
                        placeholder="Comece a escrever..."
                    />
                    <select onChange={this.pegarIdLista} name="select">
                        <option value="Escolha">Escolha uma Playlist</option>
                        {renderizarPlaylists}
                    </select>
                </form>
                <div className="BoxMusicas">
                    {this.state.loading && <Loader/>}
                    {renderizarMusicas.length === 0 && this.state.pesquisa !== "Escolha" && !this.state.loading
                        ? <p>Não encontamos nada</p>
                        : renderizarMusicas
                    }
                </div>
                <TituloBusca>Playlists Recomendadas</TituloBusca>
                <PlaylistRecomendada capturarID={this.props.capturarID}/>
            </Conainer>
        )
    }
}