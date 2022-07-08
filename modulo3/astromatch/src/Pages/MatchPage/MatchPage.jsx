import React, { useState, useEffect } from "react";
import Loader from "../../Components/Loader/Loader";
import axios from "axios";
import { Container, ContainerMatch, BoxImg } from "./style";
import NaoHaMatches from "./NaoHaMatches";

export default function MatchPage() {
    const [match, setMatch] = useState([]);
    const [loading, setLoading] = useState(true);

    const listarMatch = () => {
        axios.get(`https://us-central1-missao-newton.cloudfunctions.net/astroMatch/freire-jonatas/matches`).then((res) => {
            setMatch(res.data.matches);
            setLoading(false);
        }).catch((err) => {
            console.log(err);
        })
    }

    useEffect(() => {
        listarMatch()
    }, []);

    if (loading) {
        return <Loader />;
    }

    return (
        <Container>
            {match.length > 0 ? match.map((match) => {
                return (
                    <ContainerMatch key={match.id}>
                        <BoxImg src={match.photo}>
                            <img src={match.photo} alt="" />
                        </BoxImg>
                        <p>{match.name}</p>
                    </ContainerMatch>
                )
            }) : <NaoHaMatches/>}
        </Container>
    );
}